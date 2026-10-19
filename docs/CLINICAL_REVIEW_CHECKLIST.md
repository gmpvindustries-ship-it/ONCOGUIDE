# Clinical review checklist before any patient-facing use

- [ ] Reconcile every English source question, option and conditional rule against the master DOCX.
- [ ] Reconcile all Hindi, Marathi and Gujarati translations and verify options, not just question labels.
- [ ] Approve emergency/urgent/prompt/routine rules for the intended Indian setting.
- [ ] Verify anatomy-based eligibility and ensure gender identity is never used as a proxy for organs present.
- [ ] Verify all pathway activation criteria, overlaps, deduplication and shared-variable reuse.
- [ ] Review general risk-factor index domains and each pathway's item-to-domain mappings with a clinician and methodologist.
- [ ] Confirm that unknown/unanswered data are not silently treated as negative and that score coverage is visible.
- [ ] Validate score calculation and all score-linked actions on synthetic test cases; never auto-order imaging, tumour markers, IHC, biopsy or treatment from the prototype score.
- [ ] Develop/validate separate cancer-specific prediction models before describing any output as an absolute probability.
- [ ] Add site-specific investigation and follow-up rules only after guideline review and clinical governance approval.
- [ ] Complete browser/device accessibility testing, threat modelling, privacy/data-retention review and regulatory assessment.
- [ ] Conduct prospective/retrospective validation and independent calibration for the intended population before clinical deployment.

- [ ] Confirm all pathway-specific objective evidence mappings and how free-text investigation summaries are interpreted; verify normal/negative/benign descriptions cannot score as suspicious.
- [ ] Confirm family-history site relevance, relative degree, age-at-diagnosis handling, inherited-syndrome mappings and every numeric point weight.
- [ ] Confirm symptom-site routing for shared red flags (especially lumps, bruising/bleeding, blood in stool/urine and respiratory symptoms).
- [ ] Validate the general dietary/lifestyle index direction and remove or justify every point allocation with appropriate evidence.
- [ ] Confirm no report wording implies a probability, urgency threshold or action category from the unvalidated score.
