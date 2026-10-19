# Test coverage matrix — build 1.3.4

| Area | Automated check | What it does not establish |
|---|---|---|
| JSON and IDs | Schema parses; IDs unique; conditions reference existing questions | Exact clinical/source parity |
| Pathway registry | Every configured pathway ID is unique and question section maps to registry | Clinical appropriateness |
| Conditional questions | No-response skips dependent fields; parent change clears stale children | Every possible combination |
| Rule engine | Synthetic triggers for shared symptoms, all adult routes, anatomy gates, risk-only reviews and paediatric routes | Clinical sensitivity/specificity |
| Safety gateway | Emergency/urgent flags tested independently from scores | Medical-device validation |
| Score budgets | 18 adult pathway budgets each total 100; general domain ceilings total 100; values bounded | Calibration or probability validity |
| JavaScript/server | `node --check`, `py_compile`, local HTTP smoke test | Cross-browser/device compatibility |
| Translations | Locale keys exist; matched source translations applied when IDs/meaning align | Certified medical translation |
| Clinical validation | Not performed | Requires governance, prospective/retrospective validation and regulatory review |


## Build 1.3.5 regression addition
- Female selection resolves inferred uterus anatomy in conditional question logic, so the menstrual-history section and `R-MENARCHE` appear without displaying organ-presence questions. Menarche-dependent questions (`R-MENARCHE-AGE`, `R-CYCLE`) remain conditional on `R-MENARCHE = Yes`. Male and Transgender behaviour remains governed by the existing anatomy defaults/explicit answers.


Build 1.3.8 adds regression coverage for site-specific objective evidence, normal imaging, site-matched family history, unknown prior abnormalities, directional protective-food frequency mapping, chest-wall vs breast routing, haematologic bleeding-site consistency, and removal of unsupported score bands. Current rule-engine suite: 73 tests; package/unit suite: 10 tests. Build 1.3.8 also checks that all adult pathway scoring item IDs resolve to existing questions. These are software tests, not clinical validation.
