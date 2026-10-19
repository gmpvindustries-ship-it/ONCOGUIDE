# Source traceability report — build 1.3.4

## Source files used
- `source_documents/ONCOGUIDE ALLQUESTIONNAIRE AND SCORING.docx` — master questionnaire, four-language material and scoring tables.
- `source_documents/Pasted markdown.md` — common symptoms and detailed pathway routing notes.
- `source_documents/Pasted markdown(1).md` — two-stage workflow, safety gateway and separation of score layers.
- `source_documents/Pasted text(2).txt` — cancer-specific pilot questions.

## Integrated question modules
- Demographic intake and derived age, BMI, height/weight and activity interpretation.
- Anatomy-gated reproductive history, menstrual/menopausal bleeding, sexual history, pregnancy and lactation follow-ups, discharge characteristics and HPV/screening history.
- D001–D010 dietary history and general dietary history.
- Family cancer history, previous cancer, prior abnormality and investigation follow-up.
- C001–C016 common symptom/red-flag variables asked once, with conditional duration, site, progression, severity and urgent-safety follow-ups.
- Tobacco/nicotine product/status, age at initiation/cessation, frequency, quantity and unit, second-hand exposure; alcohol type/status/frequency/start/stop; areca/betel; occupational/environmental exposures; relevant medical risks.
- Eighteen adult pathway modules and six paediatric warning subroutes, with multi-pathway activation and separate risk/screening reviews.

## Pathway and safety architecture
- Trigger logic consumes existing answers and stores activation reasons containing the response IDs/values that support routing.
- Conditional follow-up is pathway-gated and parent-answer-gated; answers to hidden children are cleared when their condition no longer applies.
- Safety flags are calculated independently from general and pathway indices.
- Investigation guidance is displayed as clinician-directed options, not automated orders.

## Source-parity boundary
This is an integrated software implementation of the supplied workflow and identified questionnaire modules. A formal item-by-item clinical reconciliation is still required to certify exact wording, every source table row, all options and every exception. Translation fallback is intentionally English when a trustworthy matched source translation is not available.
