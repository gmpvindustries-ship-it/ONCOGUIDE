from pathlib import Path
import json,sys
ROOT=Path(__file__).resolve().parents[1]
required=['index.html','app.js','styles.css','server.py','README.md','data/questionnaire.json','data/pathways.json','assets/oncoguide-logo.png','assets/Self Breast Examination.jpeg','docs/KNOWN_LIMITATIONS.md','docs/TRACEABILITY_REPORT.md','docs/PATHWAY_COVERAGE.md','docs/CLINICAL_REVIEW_CHECKLIST.md','docs/SCORING_IMPLEMENTATION.md','docs/DEMO_GUIDE.md','docs/TRANSLATION_STATUS.md','docs/TEST_COVERAGE_MATRIX.md']
missing=[x for x in required if not (ROOT/x).is_file()]
q=json.loads((ROOT/'data/questionnaire.json').read_text()); p=json.loads((ROOT/'data/pathways.json').read_text())
count=sum(len(s['questions']) for s in q['sections'])
print('Required files:',len(required),'Missing:',missing)
print('Implemented question records:',count)
print('Pathway registry records:',len(p['pathways']))
if missing: sys.exit(1)

# Build 1.3.8 requested-change assertions
ids={q['id'] for section in q['sections'] for q in section['questions']}
section_ids={section['id'] for section in q['sections']}
assert not any(x in section_ids for x in ['meal_breakfast','meal_lunch','meal_evening_snacks','meal_dinner'])
assert not any(x.startswith('MEAL-') for x in ids)
assert 'EN004' not in ids and 'LI003' not in ids
assert {'SH000','R-PAD-FLOW','D011','D012','D-HPV-VAX','R-HPV-VAX'} <= ids
assert 'Self Breast Examination.jpeg' in [Path(x).name for x in (ROOT/'assets').iterdir()]
assert 'CO002' not in ids and 'OE003' not in ids
print('Build 1.3.8 requested-change assertions: PASS')
