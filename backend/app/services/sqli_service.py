import httpx
import re
from typing import Dict, Any, List

# Common database syntax error heuristics (non-destructive detection)
SQL_ERROR_PATTERNS = [
    (r"you have an error in your sql syntax", "MySQL / MariaDB"),
    (r"warning: mysql_", "PHP MySQL"),
    (r"unclosed quotation mark after the character string", "Microsoft SQL Server"),
    (r"quoted string not properly terminated", "Oracle DB"),
    (r"syntax error at or near", "PostgreSQL"),
    (r"pg_query\(\): query failed", "PHP PostgreSQL"),
    (r"sqlite3\.operationalerror", "SQLite"),
    (r"near \".*\": syntax error", "SQLite"),
    (r"db2 sql error", "IBM DB2"),
    (r"sql command not properly ended", "Oracle DB")
]

# Controlled, non-destructive syntax probes
SAFE_PROBES = [
    ("'", "Single quote syntax probe"),
    ("''", "Double single quote balanced probe"),
    ("\"", "Double quote syntax probe"),
    ("' OR '1'='1", "Classic boolean balanced probe (Safe check)")
]

async def check_sqli(target_url: str) -> List[Dict[str, Any]]:
    """
    Performs safe, non-destructive SQL Injection heuristics on target URL query parameters.
    No data extraction or database modification is performed.
    """
    findings = []
    
    # Identify testable parameters
    from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
    parsed = urlparse(target_url)
    qs = parse_qs(parsed.query)

    # If no parameters in URL, test common safe search/id parameters
    test_params = qs.copy() if qs else {"id": ["1"], "q": ["test"]}

    async with httpx.AsyncClient(verify=False, timeout=6.0, follow_redirects=True) as client:
        # Baseline request
        try:
            baseline_resp = await client.get(target_url, headers={"User-Agent": "VulnScan-DAST/1.0"})
            baseline_text = baseline_resp.text
        except Exception:
            return findings

        for param_name in test_params.keys():
            original_val = test_params[param_name][0] if test_params[param_name] else "1"

            for probe_val, probe_desc in SAFE_PROBES:
                modified_params = test_params.copy()
                modified_params[param_name] = [original_val + probe_val]
                new_query = urlencode(modified_params, doseq=True)
                test_url = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))

                try:
                    resp = await client.get(test_url, headers={"User-Agent": "VulnScan-DAST/1.0"})
                    resp_text = resp.text.lower()

                    # Check for DB error signatures not in baseline
                    for pattern, db_type in SQL_ERROR_PATTERNS:
                        if re.search(pattern, resp_text) and not re.search(pattern, baseline_text.lower()):
                            findings.append({
                                "title": f"Potential SQL Injection via Parameter '{param_name}'",
                                "category": "SQLI",
                                "severity": "CRITICAL",
                                "confidence": "HIGH",
                                "parameter": param_name,
                                "probe": probe_val,
                                "database_type": db_type,
                                "description": f"The target application returned a detailed database syntax error for {db_type} when supplied with non-destructive probe syntax in parameter '{param_name}'.",
                                "evidence": f"URL tested: {test_url}\nMatched Error Pattern: {pattern}",
                                "impact": "Allows attackers to execute arbitrary SQL commands, potentially exposing, modifying, or corrupting backend database contents.",
                                "remediation": "Use parameterized queries (Prepared Statements) or an Object-Relational Mapper (ORM) for all database operations. Never concatenate untrusted user input directly into SQL strings."
                            })
                            # One finding per parameter is sufficient
                            return findings
                except Exception:
                    continue

    return findings

