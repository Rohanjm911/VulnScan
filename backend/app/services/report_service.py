import os
import json
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.config import settings

def generate_pdf_report(scan_data: dict, target_data: dict, findings: list) -> str:
    """
    Generates a professional executive and technical vulnerability assessment PDF report using ReportLab.
    Returns the absolute path to the generated PDF.
    """
    filename = f"VulnScan_Report_Scan_{scan_data.get('id', 'unknown')}_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    file_path = os.path.join(settings.REPORT_DIR, filename)

    doc = SimpleDocTemplate(
        file_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#00E5FF')
    )
    
    h2_style = ParagraphStyle(
        'H2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=14,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#334155')
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=11,
        textColor=colors.white
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("VULNSCAN SECURITY AUDIT REPORT", title_style))
    elements.append(Paragraph("Automated Web Security Intelligence & Vulnerability Assessment", ParagraphStyle('Sub', parent=body_style, fontSize=11, textColor=colors.HexColor('#64748B'))))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#00E5FF'), spaceBefore=2, spaceAfter=14))

    # Target & Execution Summary Table
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "INFO": 0}
    for f in findings:
        sev = f.get("severity", "INFO").upper()
        if sev in severity_counts:
            severity_counts[sev] += 1

    summary_data = [
        [Paragraph("<b>Target Host:</b>", body_style), Paragraph(str(target_data.get("host", "N/A")), body_style),
         Paragraph("<b>Scan Date:</b>", body_style), Paragraph(str(scan_data.get("started_at", "N/A"))[:19], body_style)],
        [Paragraph("<b>Target URL:</b>", body_style), Paragraph(str(target_data.get("url", "N/A")), body_style),
         Paragraph("<b>Security Score:</b>", body_style), Paragraph(f"<b>{scan_data.get('security_score', 100)} / 100</b>", body_style)],
        [Paragraph("<b>Scan Type:</b>", body_style), Paragraph(str(scan_data.get("scan_type", "FULL")), body_style),
         Paragraph("<b>Status:</b>", body_style), Paragraph(str(scan_data.get("status", "COMPLETED")), body_style)],
        [Paragraph("<b>Total Findings:</b>", body_style), Paragraph(str(len(findings)), body_style),
         Paragraph("<b>Critical / High:</b>", body_style), Paragraph(f"{severity_counts['CRITICAL']} / {severity_counts['HIGH']}", body_style)]
    ]

    t_summary = Table(summary_data, colWidths=[110, 160, 110, 160])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#E2E8F0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 15))

    # Executive Summary Section
    elements.append(Paragraph("1. Executive Summary", h2_style))
    score = scan_data.get("security_score", 100)
    risk_level = "LOW RISK" if score >= 85 else "MODERATE RISK" if score >= 65 else "HIGH RISK" if score >= 40 else "CRITICAL RISK"
    exec_summary_text = (
        f"This report documents security findings discovered during automated assessment of {target_data.get('url')}. "
        f"The evaluated target received an overall Security Posture Score of <b>{score}/100</b> ({risk_level}). "
        f"A total of <b>{len(findings)}</b> security findings were logged, comprising {severity_counts['CRITICAL']} Critical, "
        f"{severity_counts['HIGH']} High, {severity_counts['MEDIUM']} Medium, {severity_counts['LOW']} Low, and {severity_counts['INFO']} Informational findings. "
        "All scanning operations were non-destructive and carried out strictly within authorized scope."
    )
    elements.append(Paragraph(exec_summary_text, body_style))
    elements.append(Spacer(1, 15))

    # Findings Detail Section
    elements.append(Paragraph("2. Vulnerability Findings & Technical Remediation", h2_style))

    if not findings:
        elements.append(Paragraph("<i>No security vulnerabilities or configuration defects were detected.</i>", body_style))
    else:
        for idx, finding in enumerate(findings, 1):
            sev = finding.get("severity", "INFO").upper()
            sev_colors = {
                "CRITICAL": colors.HexColor('#EF4444'),
                "HIGH": colors.HexColor('#F97316'),
                "MEDIUM": colors.HexColor('#FBBF24'),
                "LOW": colors.HexColor('#3B82F6'),
                "INFO": colors.HexColor('#6B7280'),
            }
            bar_color = sev_colors.get(sev, colors.HexColor('#6B7280'))

            finding_rows = [
                [Paragraph(f"<b>#{idx} {finding.get('title', 'Finding')}</b>", ParagraphStyle('FTitle', parent=body_style, fontName='Helvetica-Bold', textColor=colors.HexColor('#0F172A'))),
                 Paragraph(f"<font color='{bar_color.hexval()}'><b>[{sev}]</b></font> ({finding.get('category', 'GENERAL')})", body_style)],
                [Paragraph("<b>Description:</b>", body_style), Paragraph(finding.get("description", "N/A"), body_style)],
                [Paragraph("<b>Evidence:</b>", body_style), Paragraph(f"<font name='Courier' size=8>{finding.get('evidence', 'N/A')}</font>", body_style)],
                [Paragraph("<b>Remediation:</b>", body_style), Paragraph(finding.get("remediation", "Apply vendor security updates."), body_style)]
            ]

            t_finding = Table(finding_rows, colWidths=[100, 440])
            t_finding.setStyle(TableStyle([
                ('LINELEFT', (0, 0), (0, -1), 3, bar_color),
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FAFAFA')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(t_finding)
            elements.append(Spacer(1, 10))

    # Build document
    doc.build(elements)
    return file_path

