import httpx
from typing import Dict, Any, Optional

class WebhookService:
    """
    Dispatches formatted security alert notifications to Slack, Discord,
    or generic SIEM webhooks.
    """

    @classmethod
    async def send_scan_alert(
        cls,
        webhook_url: str,
        platform: str,
        target_name: str,
        target_url: str,
        scan_type: str,
        security_score: int,
        critical_count: int,
        high_count: int,
        total_findings: int,
        dashboard_url: str = "http://localhost:3000"
    ) -> bool:
        if not webhook_url:
            return False

        p = platform.upper()

        if p == "DISCORD":
            # Discord Embed formatting
            color = 0xEF4444 if critical_count > 0 else 0xF59E0B if high_count > 0 else 0x10B981
            payload = {
                "username": "VulnScan SecOps Alert",
                "avatar_url": "https://img.icons8.com/color/96/shield.png",
                "embeds": [
                    {
                        "title": f"🛡️ Security Scan Completed: {target_name}",
                        "url": dashboard_url,
                        "color": color,
                        "description": f"Automated `{scan_type}` vulnerability assessment finished for `{target_url}`.",
                        "fields": [
                            {"name": "Security Score", "value": f"**{security_score} / 100**", "inline": True},
                            {"name": "Critical Threats", "value": f"🚨 {critical_count}", "inline": True},
                            {"name": "High Severity", "value": f"⚠️ {high_count}", "inline": True},
                            {"name": "Total Findings", "value": f"📦 {total_findings}", "inline": True},
                            {"name": "Action Required", "value": "Immediate patch review advised" if critical_count > 0 else "Posture within acceptable threshold", "inline": False}
                        ],
                        "footer": {"text": "VulnScan Automated Web Security Intelligence"}
                    }
                ]
            }
        elif p == "SLACK":
            # Slack Block Kit formatting
            status_emoji = "🚨" if critical_count > 0 else "⚠️" if high_count > 0 else "✅"
            payload = {
                "text": f"{status_emoji} *VulnScan Alert:* Scan completed for `{target_name}` with Score: {security_score}/100",
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": f"{status_emoji} VulnScan Security Posture Report"}
                    },
                    {
                        "type": "section",
                        "fields": [
                            {"type": "mrkdwn", "text": f"*Target:* <{target_url}|{target_name}>"},
                            {"type": "mrkdwn", "text": f"*Scan Type:* `{scan_type}`"},
                            {"type": "mrkdwn", "text": f"*Security Score:* *{security_score} / 100*"},
                            {"type": "mrkdwn", "text": f"*Critical / High:* {critical_count} crit / {high_count} high"}
                        ]
                    }
                ]
            }
        else:
            # Generic JSON Payload
            payload = {
                "event": "scan.completed",
                "target_name": target_name,
                "target_url": target_url,
                "scan_type": scan_type,
                "security_score": security_score,
                "findings": {
                    "critical": critical_count,
                    "high": high_count,
                    "total": total_findings
                }
            }

        async with httpx.AsyncClient(timeout=6.0, verify=False) as client:
            try:
                resp = await client.post(webhook_url, json=payload)
                return resp.status_code in (200, 204)
            except Exception:
                return False

    @classmethod
    async def send_test_ping(cls, webhook_url: str, platform: str) -> Dict[str, Any]:
        success = await cls.send_scan_alert(
            webhook_url=webhook_url,
            platform=platform,
            target_name="Test Webhook Ping Target",
            target_url="https://demo.vulnscan.sec",
            scan_type="DAST_TEST",
            security_score=85,
            critical_count=0,
            high_count=1,
            total_findings=3
        )
        return {
            "success": success,
            "message": "Webhook alert delivered successfully!" if success else "Failed to deliver webhook. Check URL accessibility."
        }

