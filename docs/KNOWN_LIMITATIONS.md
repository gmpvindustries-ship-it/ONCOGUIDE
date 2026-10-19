# Known limitations and clinical governance

- The software implements the supplied source workflow as a local presentation build. The previous proprietary/source ZIP was not present in accessible materials, so this is a clean integrated build from the available master questionnaire and workflow notes, not a merge of an unseen codebase.
- The question bank includes the supplied demographic, reproductive, dietary, family/history, exposure, shared red-flag, 18 adult pathway and six paediatric warning modules. The source still requires clinician-by-clinician reconciliation before claiming exact line-by-line clinical parity.
- Some labels in pathway sections intentionally fall back to English where no reliable source translation was available. Source-mapped Hindi/Marathi/Gujarati labels are applied where question identity matches. Qualified translation review remains mandatory; do not use untranslated fallback questions in a non-English clinical workflow.
- Pathway activation and safety thresholds are explicit rule-based prototype logic, not validated referral/diagnostic criteria. They require specialty review and testing against real intended-use scenarios before patient use.
- The general risk-factor burden index and pathway assessment-priority indices use provisional engineering allocations from the supplied document. They are not calibrated probabilities, lifetime risks or validated risk categories.
- Adult BMI categories use adult reference cutoffs. Under-18 BMI is not classified using adult cutoffs; it requires age- and sex-specific growth reference interpretation.
- The software does not automatically order investigations or treatment. Investigation options are clinician-directed reference guidance only.
- No cloud persistence or server API is used. Answers remain in the page's runtime and are not designed for storing identifiable patient data. Do not enter real patient identifiers into this presentation build.
- Unit, structure, synthetic rule-engine and local HTTP tests do not establish clinical safety, regulatory compliance, privacy/security adequacy or browser/device compatibility.

- Build 1.3.8 corrects identified cross-pathway scoring/routing defects, but remaining pathway rules and numeric weights are still heuristic. The tests establish software consistency only; no sensitivity, specificity, calibration, clinical utility or safety performance has been established.
- The general diet domain is a directional lifestyle-burden proxy, not a validated composite cancer-risk measure. The current point allocations require methodologist and site-specialist review.

- Build 1.3.8 includes requested intake/UI changes. Added cooking-method and leftover-food responses are contextual and are not assigned independent cancer-risk points. The menstrual-pad flow question is optional. The “Polyendocrine Metabolic Ovarian Syndrome” wording requested for PCOS is nonstandard terminology and should be verified by a clinician before external use.
