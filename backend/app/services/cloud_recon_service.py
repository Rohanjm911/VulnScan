import dns.resolver
import httpx
from typing import Dict, Any, List

TAKEOVER_FINGERPRINTS = [
    {
        "service": "GitHub Pages",
        "cname_pattern": "github.io",
        "response_signature": "There isn't a GitHub Pages site here",
        "severity": "CRITICAL"
    },
    {
        "service": "AWS S3 Bucket",
        "cname_pattern": "s3.amazonaws.com",
        "response_signature": "NoSuchBucket",
        "severity": "CRITICAL"
    },
    {
        "service": "Heroku",
        "cname_pattern": "herokuapp.com",
        "response_signature": "No such app",
        "severity": "HIGH"
    },
    {
        "service": "Shopify",
        "cname_pattern": "myshopify.com",
        "response_signature": "Sorry, this shop is currently unavailable",
        "severity": "HIGH"
    },
    {
        "service": "Surge.sh",
        "cname_pattern": "surge.sh",
        "response_signature": "project not found",
        "severity": "HIGH"
    },
    {
        "service": "Bitbucket",
        "cname_pattern": "bitbucket.io",
        "response_signature": "Repository not found",
        "severity": "HIGH"
    },
    {
        "service": "Ghost",
        "cname_pattern": "ghost.io",
        "response_signature": "The thing you were looking for is no longer here",
        "severity": "MEDIUM"
    },
    {
        "service": "Fastly CDN",
        "cname_pattern": "fastly.net",
        "response_signature": "Fastly error: unknown domain",
        "severity": "HIGH"
    }
]

class CloudReconService:
    """
    Subdomain Takeover & Cloud Bucket Leak Identification Service.
    Detects dangling DNS pointers and misconfigured public cloud storage.
    """

    @classmethod
    async def scan_subdomain_takeovers(cls, domain: str, subdomains: List[str]) -> List[Dict[str, Any]]:
        findings = []
        clean_domain = domain.lower().replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]

        test_hosts = [clean_domain] + [f"{sub}.{clean_domain}" if not sub.endswith(clean_domain) else sub for sub in subdomains]
        test_hosts = list(set(test_hosts))[:15]  # Controlled scope

        async with httpx.AsyncClient(timeout=4.0, verify=False, follow_redirects=True) as client:
            for host in test_hosts:
                cname = None
                try:
                    answers = dns.resolver.resolve(host, 'CNAME')
                    for rdata in answers:
                        cname = str(rdata.target).rstrip('.').lower()
                        break
                except Exception:
                    pass

                if cname:
                    for fp in TAKEOVER_FINGERPRINTS:
                        if fp["cname_pattern"] in cname:
                            try:
                                resp = await client.get(f"http://{host}")
                                body = resp.text
                                if fp["response_signature"].lower() in body.lower():
                                    findings.append({
                                        "host": host,
                                        "cname": cname,
                                        "service": fp["service"],
                                        "severity": fp["severity"],
                                        "status": "VULNERABLE",
                                        "description": f"Dangling CNAME pointer to {fp['service']} ({cname}) returned takeover confirmation signature: '{fp['response_signature']}'.",
                                        "remediation": f"Remove dangling CNAME record '{host} -> {cname}' from DNS registrar, or claim resource in {fp['service']}."
                                    })
                                    break
                            except Exception:
                                pass

        return findings

    @classmethod
    async def scan_cloud_buckets(cls, base_name: str) -> List[Dict[str, Any]]:
        clean = base_name.lower().replace("https://", "").replace("http://", "").split("/")[0].split(":")[0]
        # Strip TLD for bucket permutation: e.g. example.com -> example
        company = clean.split(".")[0]

        candidates = [
            company,
            f"{company}-assets",
            f"{company}-public",
            f"{company}-data",
            f"{company}-backup",
            f"{company}-media",
            f"{company}-dev",
            f"{company}-static"
        ]

        buckets_found = []

        async with httpx.AsyncClient(timeout=3.5, verify=False) as client:
            for name in candidates:
                # 1. AWS S3 check
                s3_url = f"https://{name}.s3.amazonaws.com"
                try:
                    res = await client.get(s3_url)
                    if res.status_code == 200:
                        buckets_found.append({
                            "provider": "AWS S3",
                            "bucket_name": name,
                            "url": s3_url,
                            "status": "PUBLIC_READ_EXPOSED",
                            "severity": "CRITICAL",
                            "description": "Bucket is publicly accessible with world-readable XML object listing enabled.",
                            "remediation": "Enable AWS S3 Block Public Access (BPA) and enforce bucket IAM policies."
                        })
                    elif res.status_code == 403:
                        buckets_found.append({
                            "provider": "AWS S3",
                            "bucket_name": name,
                            "url": s3_url,
                            "status": "SECURED_EXISTS",
                            "severity": "INFO",
                            "description": "Bucket exists and is properly protected with 403 Forbidden ACLs.",
                            "remediation": "Regularly audit write permissions and bucket lifecycle rules."
                        })
                except Exception:
                    pass

                # 2. Google Cloud Storage check
                gcp_url = f"https://storage.googleapis.com/{name}"
                try:
                    res = await client.get(gcp_url)
                    if res.status_code == 200:
                        buckets_found.append({
                            "provider": "Google Cloud Storage",
                            "bucket_name": name,
                            "url": gcp_url,
                            "status": "PUBLIC_READ_EXPOSED",
                            "severity": "CRITICAL",
                            "description": "GCP Storage bucket allows unauthenticated public reads of bucket objects.",
                            "remediation": "Remove allUsers / allAuthenticatedUsers permissions from GCP bucket IAM."
                        })
                except Exception:
                    pass

        return buckets_found

