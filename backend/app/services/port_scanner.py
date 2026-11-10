import asyncio
import socket
from typing import List, Dict, Any

COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    445: "SMB",
    993: "IMAPS",
    995: "POP3S",
    3000: "Node/React Dev",
    3306: "MySQL",
    5432: "PostgreSQL",
    6379: "Redis",
    8000: "HTTP-Alt / FastAPI / Django",
    8080: "HTTP-Proxy / Spring",
    8443: "HTTPS-Alt",
    9000: "PHP-FPM / SonarQube",
    27017: "MongoDB"
}

async def scan_single_port(host: str, port: int, timeout: float = 1.0) -> Dict[str, Any] | None:
    """Safely connects to a single TCP port using standard TCP connect, grabs banner if possible."""
    try:
        conn = asyncio.open_connection(host, port)
        reader, writer = await asyncio.wait_for(conn, timeout=timeout)
        
        banner = ""
        try:
            # Send simple probe for banner
            if port in (80, 8080, 8000, 3000):
                writer.write(b"HEAD / HTTP/1.0\r\n\r\n")
            elif port in (21, 22, 25, 110):
                pass # Banner sent on connect
            await writer.drain()
            
            banner_data = await asyncio.wait_for(reader.read(256), timeout=0.8)
            banner = banner_data.decode("utf-8", errors="ignore").strip().split("\n")[0]
        except Exception:
            pass
        finally:
            writer.close()
            try:
                await writer.wait_closed()
            except Exception:
                pass

        service = COMMON_PORTS.get(port, "Unknown")
        return {
            "port": port,
            "state": "open",
            "service": service,
            "banner": banner[:120] if banner else None,
            "protocol": "TCP"
        }
    except Exception:
        return None

async def scan_ports(host: str, ports: List[int] | None = None, concurrency: int = 20) -> List[Dict[str, Any]]:
    """Runs a controlled, safe asynchronous TCP port scan against specified or common ports."""
    target_ports = ports or list(COMMON_PORTS.keys())
    semaphore = asyncio.Semaphore(concurrency)

    async def sem_scan(port: int):
        async with semaphore:
            return await scan_single_port(host, port)

    tasks = [sem_scan(p) for p in target_ports]
    results = await asyncio.gather(*tasks)
    open_ports = [r for r in results if r is not None]
    return sorted(open_ports, key=lambda x: x["port"])

