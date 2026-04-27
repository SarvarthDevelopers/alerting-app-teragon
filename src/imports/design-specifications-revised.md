## Mobile & Web Alerting Application

**Version 3.2 – Revised Stakeholder Review**\
**Date:** 10 Mar 2026\
**Stakeholders:** Teragon, Sarvārth Engineering & Design, Mill Operators (Pilot), IT/OT (Pilot)

---

## 1. Executive Summary

This initiative delivers a **mobile-first alerting application** along with a progressive web app dashboard for steel mill quality control environments.

The system visualizes the latest measurement summaries per inspection system and provides immediate visual and audible alerts when anomalies are detected. Operators can acknowledge alerts in real time, ensuring no critical event goes unnoticed during active production.

A dedicated alerting database will be implemented as part of this project. It will store standardized measurement summaries, supported systems, anomaly types, and alert lifecycle records while remaining architecturally independent, enabling future system modernization without impacting Teragon’s legacy systems.

The alerting database will be populated by Teragon-side integrations. The web and mobile applications will access only this alerting database and will not poll or integrate directly with legacy system databases.

**Primary objective:**\
Ensure detected anomalies are surfaced, acknowledged, and tracked in real time to reduce operational risk and response delays, while keeping the solution generic enough to support different systems, anomaly definitions, and future customer deployments.

---

## 2. Scope & Core Principles

- Dedicated database server, deployable on Windows or Linux.
- Containerized deployment on Windows using Docker with Linux containers is acceptable.
- Proposed database: PostgreSQL or MariaDB, with final selection based on implementation preference.
- Client connectivity via IP over LAN, WLAN, and/or customer VPN..
- Clean separation between legacy systems and alerting infrastructure.
- Applications connect only to the alerting database.
- Generic system model to support a configurable number of measurement systems.
- Generic anomaly model to support a configurable number of anomaly types.
- Future-ready database design to support system evolution and rollout across multiple customer environments.

---

## 3. Users & Core Scenarios

### Primary Users

- Line Operators (Android mobile)
- Shift Leads / Quality Engineers (Web dashboard)
- Admin / Configuration Users

### Core Scenarios

**Real-Time Alert**

- A new measurement containing one or more anomalies is recorded in the alerting database.
- Web and mobile applications immediately surface the alert.
- Alarm sound plays; mobile device vibrates and blinks flashlight.
- View auto-focuses on the relevant measurement system and affected product.
- Operator acknowledges the alert.

**Operational Overview**

- Shift lead reviews all recent products per system (including normal ones without anomalies).
- Shift lead filters by system, anomaly type, and product type.
- Shift lead switches between latest-item view and time-range view for historical review.
- Shift lead reviews unacknowledged alerts.
- Shift lead exports event logs.

**System Configuration**

- Store supported measurement systems as a configurable list in the alerting database.
- Web and mobile automatically display system names and count from this configuration.
- Configure anomaly types as part of deployment setup.
- Adjust number of displayed items (N) for latest-item views.
- Define configurable colors for anomaly types.
- Set polling cadence for application reads from the alerting database.
- Toggle supported systems.
- Configure display unit system for the web application.

---

## 4. Functional Requirements

### 4.1 Database Schema

**Measurement summaries will contain at minimum:**

- Product Serial Number
- Timestamp
- Product Type
- Length (mm)
- Measurement System
- One or more detected anomalies

**Each anomaly record should contain at minimum:**

- Anomaly Type
- Start Position (mm)
- Length (mm)
- End Position (derived as start position + length, or stored if required)

**Configuration/master data tables should support at minimum:**

- Measurement systems (generic list of supported systems)
- Anomaly types (generic list of supported anomaly categories)
- Configurable display attributes such as anomaly colors

**Normal measurements (no anomalies) are also stored and displayed.**

Schema to be finalized jointly with Teragon during Week 1.

---

### 4.2 Web Application (Control Room)

- Generic support for a configurable number of measurement systems.
- Separate views/pages per measurement system, generated from configured system definitions.
- Display latest N products per system.
- Optional time-span-based view for historical review.
- **Fields shown:** 
  - Serial Number
  - Timestamp
  - Product Type
  - Length
  - Measurement System
  - Alert / anomaly status
- Some representation in chart/graph form.
- Display all recent products, including those with no anomalies (no alarm triggered). Normal products show as OK/green without alert behavior.
- Row or card treatment should clearly distinguish products containing anomalies.
- Anomalies visualized along product length as colored boxes, where the start equals anomaly position and the end equals position plus anomaly length.
- Different anomaly types should be visually distinguishable and color-configurable.
- Alarm banner when new anomalies are detected.
- One-click acknowledgment.
- Configurable colors and polling interval.
- Filter to ignore selected systems.
- Filter to include/exclude selected anomaly types.
- Filter to show only products of a selected product type.
- Unit conversion support for metric and American units (mm / inch / feet) in the web application.

---

### 4.3 Mobile Application (Android)

- Same generic system structure and list model as web.
- Optimized for high-contrast industrial use.
- Large tap targets.
- **Alarm behavior:** 
  - Audible alert
  - Vibration
  - Flashlight blinking
  - Automatic focus to relevant system
- Offline cache of last N products.
- Clear stale-data indicator.
- Automatic re-synchronization upon reconnect.
- Visible manual re-sync button.
- Configurable anomaly-type colors should remain consistent with web where applicable.
- Display all recent products, including those with no anomalies (no alarm triggered).
- Filtering support should align with essential operational needs on mobile, with detailed historical review remaining web-first unless otherwise finalized during UX definition.

---

### 4.4 Alarm Lifecycle

**Alarm states:**

- NEW
- ACKNOWLEDGED
- CLEARED

**Acknowledgment records:**

- User ID
- Timestamp
- Associated Serial Number
- Measurement System
- Related anomaly reference(s), where applicable

Alarm state transitions are managed within the alerting database layer.

---

## 5. Non-Functional Requirements

### Performance

- Target alarm latency: ≤ 2 seconds under agreed polling cadence from the alerting database.
- List rendering for N ≤ 50 within 300 ms.
- Historical time-span filtering should remain responsive under agreed pilot data volumes.

### Reliability

- Pilot uptime target: ≥ 99.5%.
- Automatic reconnection after network interruptions.
- Local caching on mobile.
- Graceful behavior when alerting database connectivity is temporarily unavailable.

### Security

- **Role-based access control:** 
  - Operator
  - Lead
  - Admin
- Secure communication over TLS.
- No hard-coded credentials.
- Secure mobile storage practices.
- Access limited to the alerting database surface and application services.

### Accessibility & Industrial UX

- WCAG 2.2 AA principles applied where relevant: 
  - Minimum target sizes (≥ 44 px)
  - Clear focus states
  - Status messages visible without reliance on color alone
- Screen wake behavior for monitoring environments.
- High-contrast visual hierarchy for factory lighting conditions.
- Anomaly types must remain distinguishable beyond color alone where practical.

---

## 6. Architecture Overview

```text
[Teragon Data Writers / Integration Layer]
                │
                ▼
     [Dedicated Alerting Database Server]
                │
                │  (Application / Services Layer)
                ▼
   [Web Application]      [Android Application]
```

- The alerting database is the single application-facing source of truth.
- Teragon-side integrations populate the alerting database.
- Web and mobile applications poll only the alerting database.
- No direct polling or coupling to legacy MariaDB or other legacy system databases is required on the application side.
- Alert engine logic detects anomalies and triggers UI alarms.
- Acknowledgments are stored in the alerting database.
- System is designed for future extensibility and modernization.

---

## 7. Delivery Plan

### Base Delivery Window (6–8 Weeks)

**Week 1**

- Finalize database schema, including system and anomaly-type master data.
- Confirm deployment environment.
- Freeze core UI behavior.

**Week 2**

- Database server setup.
- Alert detection logic implementation.
- Seed configuration approach for systems and anomaly types.

**Week 3**

- Web application development.

**Week 4**

- Android application development.

**Week 5**

- End-to-end integration.
- Performance validation.
- UX and accessibility validation.

**Week 6**

- Initial deployment on Teragon hardware, subject to project progress and infrastructure readiness.
- Dry-runs in Teragon environment.
- Issue resolution.

**Weeks 7–8 (Optional / Buffer)**

- KPI export.
- Stability tuning.
- Documentation refinement.
- Source code packaging and handover preparation.

### Pilot Deployment Note

Mill pilot deployment is expected to occur later, beginning with a first pilot at Jindal when site readiness and connectivity arrangements are confirmed. Support for that first mill deployment is considered part of the broader project collaboration, even if it occurs outside the initial 6–8 week implementation window.

---

## 8. Acceptance Criteria

- Alerting database deployed and operational on agreed customer or Teragon infrastructure.
- Web and mobile applications display latest products per configured system.
- Web application supports latest-N view and time-span-based historical view.
- Multiple configurable anomaly types are supported.
- Anomaly records include position and length information.
- Anomalies are visualized as length-based boxes rather than only thin markers.
- Visual and audible alerts trigger for anomaly records.
- Alarm auto-focus and acknowledgment function correctly.
- Configurable systems, anomaly types, colors, polling, and key filters are operational.
- Product-type filtering and anomaly-type filtering are operational.
- Metric and American unit conversion is available in the web application.
- Offline handling on mobile is validated.
- Documentation and source code are delivered.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Schema misalignment | Finalize and freeze schema, including systems and anomaly types, during Week 1 |
| Alert flooding | Implement grouping, prioritization, and rate management |
| Network interruptions | Local caching, stale-data indicators, and auto-reconnect |
| Scope expansion | Role definitions, configuration boundaries, and delivery cut lines agreed early |
| Infrastructure delays on first deployment target | Maintain flexibility on deployment environment and timing based on readiness |
| Mill connectivity uncertainty for later pilot | Confirm connectivity approach with Jindal closer to pilot deployment |

---

## 10. Documentation & Handover

- Database installation guide.
- Web deployment guide.
- Mobile deployment guide.
- User guide (alerts, acknowledgment, filters, configuration, unit conversion).
- Environment configuration checklist.
- Source code handover as part of project delivery.

---

## 11. Final Inputs Status

1. **Deployment OS:** Windows preferred; Linux also acceptable; Dockerized Linux deployment on Windows is acceptable.
2. **Preferred Database:** PostgreSQL or MariaDB, either acceptable; implementation team may finalize.
3. **Network Configuration:** Support both WLAN and VPN.
4. **Measurement Systems:** Maintain as a generic configurable list in the database.
5. **Anomaly Types:** Maintain as a generic configurable list in the database.

---

## 12. Change Notes Incorporated in This Revision

- Replaced fixed system assumptions with a generic configurable system model.
- Replaced binary Good/Anomaly status assumption with support for multiple configurable anomaly types.
- Expanded anomaly data model to include position and length, with box-based visualization.
- Clarified that application-side polling is only from the alerting database, not from legacy databases.
- Added configurable anomaly-type colors.
- Added web unit conversion between metric and American units.
- Expanded filters to include anomaly types, product type, and time-span view.
- Updated deployment and pilot expectations to reflect Teragon hardware first and later Jindal mill pilot support.
- Added source code delivery to documentation and handover scope.