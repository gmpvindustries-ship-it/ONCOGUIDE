# ONCOGUIDE — Integrated Presentation Build 1.3.8

**Local URL:** http://localhost:8900  
**Build status:** Integrated rule-based presentation implementation of the supplied workflow, questionnaire modules, 18 adult cancer-assessment pathways, and six paediatric warning subroutes. Clinical validation is not complete.

## Run on Windows
1. Extract the ZIP to a writable folder.
2. Open the folder in Visual Studio Code.
3. Open Terminal → New Terminal.
4. Run `py server.py` (or `python server.py`). If port 8900 is already occupied by another application, stop that terminal with `Ctrl+C` first.
5. Open `http://localhost:8900`.
6. Stop the server with `Ctrl+C`.

The server binds to `127.0.0.1` only. Do not open `index.html` directly: the app fetches the local JSON files over HTTP.

## Included workflow
- Four-language selector: English, Hindi, Marathi and Gujarati.
- Demographics with age/DOB, height and weight conversion, BMI calculation, physical-activity duration and age-appropriate interpretation note.
- Sex/gender-based anatomy handling: Male/Female selections use the configured default anatomy assumptions; anatomy questions are asked only when Transgender is selected. Reproductive history, pregnancy/LMP/EDD and discharge follow-ups remain conditional; menstrual-history conditions use inferred uterus anatomy for Female selections, so these questions activate without exposing organ-presence questions.
- General dietary history with cooking-method and leftover-food questions; no meal-by-meal food selection.
- Family history, previous cancer/abnormal findings, investigation history, tobacco/nicotine, alcohol, areca/betel, occupational/environmental exposures and detailed conditional follow-ups.
- Common symptom/red-flag questions asked once and reused across pathways.
- Conditional follow-ups are shown only when parent answers make them relevant; hidden follow-up answers are cleared when their condition becomes false.
- Multi-pathway activation with recorded response evidence; risk/screening reviews are kept separate from symptomatic pathway activation.
- Eighteen adult pathways: thyroid, oral cavity, head and neck, lung, liver, endometrial, splenic/haematologic, colorectal, cervical, stomach, oesophageal, leukaemia, ovarian, non-Hodgkin lymphoma, prostate, hypopharyngeal, laryngeal and breast.
- Paediatric assessment umbrella and CNS, ocular, abdominal/renal, bone/soft tissue, germ-cell and haematologic warning routes.
- Independent safety gateway; emergency/urgent flags are not suppressed by scores.
- General risk-factor burden index /100 and pathway assessment-priority index /100 using the source's provisional point allocations; unknown domains are not treated as negative. Totals are withheld when any weighted domain is unassessed; an observed subtotal is retained for audit. Score totals are not assigned low/intermediate/high clinical categories.
- Pathway-specific clinician-directed initial investigation guidance, plus conditional tumour-marker, histopathology/IHC and molecular-testing considerations for activated pathways. These are not automatic test orders; markers are context-specific and depend on clinical/pathology review.
- Assessment ID, audit events, review, print/Save as PDF and JSON export.
- Synthetic demo cases for adult neck lump, colorectal symptoms, paediatric eye warning and emergency safety override.

## Important scoring and clinical boundary
The source itself says the prototype weights are not validated. The displayed indices are engineering summaries—not absolute risk, lifetime risk, diagnostic probabilities or validated referral thresholds. A score of 80/100 does **not** mean an 80% chance of cancer. Emergency guidance and symptom-based pathway activation operate independently of the score. The app does not automatically order CT, PET-CT, IHC, tumour markers, biopsy or treatment.

## Verification
Run these commands from the extracted folder:
```powershell
node --check app.js
node tests/rule_engine_test.js
python -m unittest discover -s tests -v
python -m py_compile server.py
python tests/verify_package.py
```
The tests exercise the rule engine using synthetic responses; they are not clinical validation.

## Presentation guidance
Use synthetic demo cases only. State that ONCOGUIDE captures history, runs a rule-based safety gateway, activates relevant pathways with explicit reasons, and produces clinician-directed next-step guidance. Do not state that it diagnoses cancer or predicts a validated probability.

## Remaining pre-deployment governance
Before real patient use, a qualified clinical team must sign off on every question, conditional dependency, pathway trigger, safety threshold, investigation message, translation and point mapping; validate intended-use performance and calibration; complete privacy/security/regulatory review; and add production-grade persistence, access controls and consent. This package is a presentation build, not a certified clinical product.


## Anatomy and marker-guidance notes
- To reduce unnecessary questions, organ-presence questions for cervix, uterus, ovaries and prostate are hidden unless Transgender is selected. For Male/Female selections, the prototype infers a default anatomy mapping; this may be wrong after surgery or for individual variation and must be confirmed clinically before any real use. “Prefer not to say” leaves anatomy unknown.
- Activated pathway reports now include initial investigations, context-dependent serum/other tumour-marker considerations, pathology/IHC examples and specialist-directed molecular/genetic testing considerations. These do not constitute test orders. Many serum tumour markers are not suitable for screening or stand-alone diagnosis; pathology panels are chosen by the pathologist after morphology and differential diagnosis.
- The index does not independently trigger tests. Urgent safety flags remain independent of scoring.


## Scoring and routing corrections — build 1.3.8
- Generic abnormal tests and “other/unknown” lesions no longer earn site-specific suspicious-finding points without relevant site evidence; explicit normal/negative/benign results are not scored as suspicious.
- Pathway-specific family history requires a relevant family cancer site or a recorded inherited cancer syndrome; prior lesion history is site-matched where configured.
- Breast vs chest-wall lump location is distinguished. Shared lump responses only contribute to pathways when the location matches.
- Leukaemia routing no longer treats all bleeding types/sites as haematologic bruising/bleeding; relevant symptom type and site are checked.
- Diet-burden mapping was corrected so frequent fruit/vegetable, wholegrain/pulse and nut/seed intake is not treated as harmful exposure.
- Duplicate source question IDs are not counted twice in one pathway, even if the earlier domain is not scorable.
- Score-band interpretation and score-tier investigation advice were removed. Clinical review and safety advice are independent of score magnitude.
- Regression tests: 73 JavaScript rule-engine tests and 10 Python package/unit tests. These are software tests, not clinical validation.

## Small UI patch: cooking fuel and date entry
- Added diet question `D013` for household cooking fuel/stove (LPG, piped natural gas, electric/induction, biogas, traditional chulha using firewood/crop residue/dung cakes, kerosene, coal/charcoal, shared cooking facility, other, unsure), with Hindi, Marathi and Gujarati labels/options.
- `D013` is contextual exposure information and is not assigned independent cancer-risk points.
- Date-of-birth entry now automatically inserts slashes as digits are typed: `25011996` becomes `25/01/1996`. Calendar selection remains available.
- This is a questionnaire/UI patch, not a clinical validation or a change to cancer-risk scoring.
