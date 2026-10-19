# ONCOGUIDE presentation guide

## Start

1. Run `py server.py` from the extracted folder.
2. Open `http://localhost:8900`.
3. Use the **Presentation shortcuts** to load a synthetic case. Confirm the dialog; all sample names are clearly marked as synthetic.

## Demo flow A — adult neck lump

1. Click **Adult neck-lump case**.
2. Show the live routing preview: thyroid, head-and-neck and laryngeal routes are activated from the synthetic responses.
3. Click each active pathway in the section navigation to demonstrate pathway-specific follow-up questions.
4. Select the last active pathway and click **Review assessment**.
5. Click **Generate assessment report**.
6. Show the independent safety gateway, general risk-factor index and its coverage, each pathway's activation reason and index-domain breakdown, the missing information, and the next-step text.

## Demo flow B — colorectal symptoms

1. Click **Bowel-symptom case**.
2. Show colorectal pathway activation for bright-red blood and persistent bowel changes. Then load **Black-stool urgent case** to demonstrate that black tar-like stool raises an independent urgent safety flag.
3. Open colorectal assessment, then review and generate the report.

## Demo flow C — black tar-like stool urgent assessment

1. Click **Black-stool urgent case**.
2. Show that the colorectal pathway activates and the independent urgent safety warning is displayed.
3. Explain that safety flags do not depend on a score.

## Demo flow D — paediatric eye warning

1. Click **Paediatric eye-warning case**.
2. Show the paediatric assessment umbrella and ocular warning subroute.
3. Open the ocular follow-up section. Explain that the route requests clinician assessment and does not assign a paediatric cancer probability.

## Demo flow E — safety override

1. Click **Emergency safety case**.
2. Show the emergency warning in the live routing preview.
3. Explain that safety rules are independent of the numerical indices and cannot be overridden by a low score.

## Language switch

Change the language selector to Hindi, Marathi or Gujarati. The interface and source-mapped labels switch where translations are available. Some newer questions/options still use English fallback; describe this as a draft localization rather than a fully clinically verified translation.

## Important presentation wording

Say: “ONCOGUIDE is a rule-based assessment and routing prototype. It captures symptoms and background risk factors, activates relevant assessment pathways, separates safety overrides from scoring, and reports missing information. Its prototype indices are not validated cancer probabilities.”

Do not say that the application diagnoses cancer, predicts lifetime risk, is clinically validated, or automatically determines a need for CT/PET-CT, tumour markers, IHC or biopsy.


## Demonstrate investigation guidance
After generating a report for a synthetic case that activates a pathway, expand the pathway card to show the initial investigation guidance and the tumour-marker / pathology-IHC / molecular-testing considerations. Emphasise that the guidance is conditional, not an automatic order, and that tissue markers are selected by a pathologist after histopathological assessment.
