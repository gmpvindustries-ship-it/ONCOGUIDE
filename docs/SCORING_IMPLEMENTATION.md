# Scoring implementation and interpretation

## Separation of outputs

The application deliberately separates:

1. **General risk-factor burden index** — one 100-point profile using the master document's nine domain ceilings.
2. **Cancer-pathway assessment-priority index** — a separate 100-point rule-based summary for each activated source-specified pathway.
3. **Safety flags and pathway activation** — independent of both indices; a low index cannot suppress a safety flag.
4. **Validated cancer probability** — not available in this prototype. No absolute probability or lifetime risk is calculated.

## General 100-point domain ceilings

| Domain | Maximum |
|---|---:|
| Tobacco and nicotine exposure | 20 |
| Areca, supari and betel quid | 15 |
| Alcohol exposure | 10 |
| Personal cancer history / relevant high-risk lesions | 15 |
| Family history / hereditary predisposition | 15 |
| Occupational and household exposures | 10 |
| Diet-related exposures | 5 |
| Physical activity and adiposity | 5 |
| Other established site-specific medical risks | 5 |
| **Total** | **100** |

These ceilings come from the supplied master scoring table. The item-level mappings are prototype engineering rules and require clinician/methodologist review. Ethnicity and gender identity do not earn risk points. Symptoms are primarily used for safety triage and pathway activation, not added indiscriminately to the general burden index.

## Pathway index

For the 18 source-specified pathways, the build uses the master document's domain ceilings. The full domain names and ceilings are documented in the master DOCX tables; the implementation is in `app.js` under `pathwaySpecs`. Each domain is assigned 0%, 25%, 60% or 100% of its ceiling based on the recorded absence, patient-reported presence, persistent/recurrent findings or a relevant documented/high-priority finding. If the domain cannot be assessed, it is marked unscored and coverage is reduced; it is not silently treated as negative.

The build does not assign low/intermediate/high clinical categories to score totals. These indices are experimental descriptive summaries only; no numeric score is a referral threshold, urgency classification, diagnostic category or cancer probability. Site-specific investigation text is checked for relevance and explicit normal/negative wording. Generic abnormal-test answers are not credited to a cancer site without matching site-specific evidence. Unclear site-relevant findings remain provisional and require clinician verification.

Paediatric warning routes do not receive a cancer score. They display rule-based routing only.

## Clinical action rules

- Emergency/urgent safety rules are independent of the indices.
- The software does not automatically order CT, PET-CT, IHC, tumour markers, biopsy or treatment.
- A positive HPV result is not labelled as cancer; it activates follow-up assessment when relevant anatomy is present.
- Previous cancer, family history and unresolved abnormalities can create separate clinician-review items without automatically activating every cancer pathway.
- Several pathways may activate when distinct criteria are met. A symptom may inform more than one relevant pathway, but pathway scores must not be added together to create a total cancer risk.

## Required validation before clinical deployment

Verify the exact item-level mapping, evidence for each rule, population applicability, calibration, fairness, score-linked actions and clinical outcomes. Do not use this prototype index to make patient-care decisions.


## Scoring safeguards added in build 1.3.8

- A generic abnormal investigation or “other/unknown” prior abnormality is not automatically scored as a suspicious finding for every pathway. Site relevance and the described result must be checked. Explicitly normal/negative/benign wording is not treated as suspicious objective evidence.
- Family-history points in a pathway require a relevant family cancer site or a recorded inherited cancer syndrome; “family history: yes” alone does not create pathway-specific points. Relationship, age at diagnosis and verification remain clinically important and may be missing.
- Personal prior-lesion points are not assigned to an unspecified “other/unknown” lesion. Site-specific personal history is kept separate from objective investigation scoring where configured.
- A shared lump answer is scored only when its location matches the pathway. The intake distinguishes breast from chest-wall lumps to reduce incorrect breast routing.
- The leukaemia route does not treat every report of bleeding, such as vaginal bleeding, as haematologic bruising/bleeding. Symptom subtype and site must be consistent with a haematologic signal.
- Fruit/vegetable, wholegrain/pulse and nut/seed frequency is directionally handled as a low-intake lifestyle-burden proxy, not as a harmful exposure. This remains an unvalidated composite and must not be presented as cancer risk.
- Repeated source question IDs are claimed once per pathway regardless of whether the first domain is scorable, reducing duplicate counting across domains.
- All numeric bands were removed from score interpretation. Clinical advice is displayed independently of score magnitude; concerning symptoms and safety flags cannot be overridden by a low score.

These software changes improve internal consistency but do not validate the point weights or prove clinical performance. The complete point mapping and pathway triggers still require specialist review and validation on appropriate data before any real-patient use.

- A 100-point total is displayed only when all weighted domains are assessable. If coverage is incomplete, the total is withheld and an observed subtotal is retained for audit; missing domains are not treated as zero. For the general diet domain, all ten diet items must be answered before the domain contributes to the total. Both prior-cancer and prior-abnormality statuses must be known before the combined personal-history domain contributes.

- The Build 1.3.8 diet questions for cooking method (D011) and leftover food (D012) are not assigned independent points. The existing dietary-burden proxy remains limited to its defined D001–D010 items; this avoids inventing unsupported weights.
