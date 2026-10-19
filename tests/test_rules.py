import json, re, unittest, subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class PackageTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.q=json.loads((ROOT/'data/questionnaire.json').read_text())
  cls.p=json.loads((ROOT/'data/pathways.json').read_text())
  cls.js=(ROOT/'app.js').read_text()
 def test_question_ids_unique(self):
  ids=[q['id'] for s in self.q['sections'] for q in s['questions']]
  self.assertEqual(len(ids),len(set(ids)))
  self.assertGreaterEqual(len(ids),240)
 def test_question_fields_and_locales(self):
  for s in self.q['sections']:
   for q in s['questions']:
    self.assertTrue(q.get('id')); self.assertTrue(q.get('label')); self.assertTrue(q.get('type'))
    for locale in ('en','hi','mr','gu'): self.assertIn(locale,q['label'])
 def test_condition_references_known_id(self):
  ids={q['id'] for s in self.q['sections'] for q in s['questions']}
  for s in self.q['sections']:
   for q in s['questions']:
    if q.get('showIf'):
     self.assertIn(q['showIf']['question'],ids)
     if q['showIf'].get('excludeQuestion'): self.assertIn(q['showIf']['excludeQuestion'],ids)
    for rule in q.get('showIfAll',[])+q.get('showIfAny',[]): self.assertIn(rule['question'],ids)
 def test_pathway_ids_unique_and_questions_registered(self):
  ids=[p['id'] for p in self.p['pathways']]
  self.assertEqual(len(ids),len(set(ids)))
  self.assertGreaterEqual(len(ids),25)
  section_ids={s.get('pathwayId') for s in self.q['sections'] if s.get('pathwayId')}
  self.assertTrue(section_ids.issubset(set(ids)))
  self.assertIn('breast',ids); self.assertIn('colorectal',ids); self.assertIn('paediatric_ophthalmic',ids)
 def test_required_files(self):
  for f in ['index.html','app.js','styles.css','server.py','README.md','assets/oncoguide-logo.png','docs/KNOWN_LIMITATIONS.md','tests/rule_engine_test.js','docs/SCORING_IMPLEMENTATION.md','docs/DEMO_GUIDE.md','data/pathways.json']:
   self.assertTrue((ROOT/f).is_file(),f)
 def test_scoring_disclaimer_and_safety_override(self):
  self.assertIn('No cancer probability is calculated',self.js)
  self.assertIn('function generalRiskIndex()',self.js)
  self.assertIn('function pathwayIndex(id)',self.js)
  self.assertIn('function safetyFlags()',self.js)
  self.assertIn('function activation()',self.js)
  self.assertIn('EMERGENCY',self.js)
 def test_rule_engine_synthetic_scenarios(self):
  r=subprocess.run(['node',str(ROOT/'tests/rule_engine_test.js')],capture_output=True,text=True)
  self.assertEqual(r.returncode,0,r.stdout+'\n'+r.stderr)
  self.assertIn('rule-engine tests passed',r.stdout)
 def test_build_version_and_localhost_port(self):
  self.assertEqual(self.q.get('version'),'ONCOGUIDE-PRESENTATION-1.3.8')
  self.assertEqual(self.p.get('version'),'ONCOGUIDE-PATHWAYS-1.3.8')
  self.assertIn('PORT = 8900',(ROOT/'server.py').read_text())
  self.assertIn('localhost:8900',(ROOT/'README.md').read_text())
 def test_breast_vs_chest_wall_options_are_unambiguous(self):
  q=next(q for sec in self.q['sections'] for q in sec['questions'] if q['id']=='C005-LOC')
  self.assertIn('Breast',q['options']); self.assertIn('Chest wall',q['options']); self.assertNotIn('Breast or chest',q['options'])
 def test_required_workflow_sections(self):
  ids=[s['id'] for s in self.q['sections']]
  self.assertEqual(ids[:3],['demographics','reproductive','diet'])
  self.assertTrue(ids.index('diet')<ids.index('family_history')<ids.index('redflags')<ids.index('exposures'))
  self.assertNotIn('meal_breakfast',ids); self.assertNotIn('meal_lunch',ids); self.assertNotIn('meal_evening_snacks',ids); self.assertNotIn('meal_dinner',ids)
  self.assertIn('pediatric_flags',ids)
  self.assertEqual(sum(len(s['questions']) for s in self.q['sections']),len({q['id'] for s in self.q['sections'] for q in s['questions']}))
if __name__=='__main__': unittest.main()
