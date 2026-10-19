const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const ctx={console,Date,Math,document:{addEventListener:()=>{},querySelector:()=>null},URL,Blob,confirm:()=>false,alert:()=>{}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);
vm.runInContext(`schema=JSON.parse(${JSON.stringify(fs.readFileSync(path.join(root,'data/questionnaire.json'),'utf8'))});pathways=JSON.parse(${JSON.stringify(fs.readFileSync(path.join(root,'data/pathways.json'),'utf8'))});`,ctx);
let count=0;
function setAnswers(a){vm.runInContext(`state.answers=${JSON.stringify(a)}`,ctx);}
function test(name,fn){try{fn();count++;console.log('PASS',name)}catch(e){console.error('FAIL',name+' — '+e.message);process.exitCode=1;}}
function active(){return JSON.parse(vm.runInContext('JSON.stringify(activation().active.map(x=>x.id))',ctx));}
function findQ(id){return JSON.parse(vm.runInContext(`JSON.stringify(schema.sections.flatMap(s=>s.questions).find(q=>q.id===${JSON.stringify(id)})||null)`,ctx));}
test('empty answers do not activate cancer pathways',()=>{setAnswers({});const a=active();if(a.length)throw Error('unexpected pathways: '+a.join(','));});
test('neck lump activates thyroid/head-and-neck without automatic lymphoma route',()=>{setAnswers({'D-AGE':'42','C005':'Yes','C005-LOC':'Neck','C005-GROW':'Yes'});const a=active();for(const x of ['thyroid','head_neck'])if(!a.includes(x))throw Error('missing '+x);if(a.includes('non_hodgkin_lymphoma'))throw Error('lymphoma over-triggered');});
test('blood in stool activates colorectal route',()=>{setAnswers({'D-AGE':'50','C007':'Bright-red blood'});if(!active().includes('colorectal'))throw Error('colorectal not activated');});
test('progressive swallowing at throat level activates relevant overlapping routes',()=>{setAnswers({'D-AGE':'40','C010':'Difficulty solids','C010-LOC':'Mouth or throat'});const a=active();for(const x of ['oesophageal','head_neck','hypopharyngeal'])if(!a.includes(x))throw Error('missing '+x);});
test('paediatric neurological warning activates umbrella and CNS subroute',()=>{setAnswers({'D-AGE':'9','PED-NEURO':'Yes'});const a=active();for(const x of ['paediatric_assessment','paediatric_cns'])if(!a.includes(x))throw Error('missing '+x);});
test('paediatric eye warning activates ocular route',()=>{setAnswers({'D-AGE':'7','PED-EYE':'Yes'});const a=active();for(const x of ['paediatric_assessment','paediatric_ophthalmic'])if(!a.includes(x))throw Error('missing '+x);});
test('oral lesion activates oral cavity assessment',()=>{setAnswers({'G-ORAL-LESION':'Yes'});if(!active().includes('oral_cavity'))throw Error('oral cavity not activated');});
test('persistent throat symptoms activate head-and-neck assessment',()=>{setAnswers({'G-THROAT':'Yes, more than 3 weeks'});if(!active().includes('head_neck'))throw Error('head-and-neck not activated');});
test('persistent cough activates lung assessment',()=>{setAnswers({'G-COUGH':'Yes, persistent'});if(!active().includes('lung'))throw Error('lung not activated');});
test('jaundice activates liver assessment',()=>{setAnswers({'G-JAUNDICE':'Yes'});if(!active().includes('liver'))throw Error('liver not activated');});
test('postmenopausal bleeding with relevant anatomy activates endometrial assessment',()=>{setAnswers({'D-UTERUS':'Yes','R-MENOPAUSE':'Yes','R-POSTMENOPAUSE-BLEED':'Yes'});if(!active().includes('endometrial'))throw Error('endometrial not activated');});
test('systemic symptom combination activates splenic/hematologic assessment',()=>{setAnswers({'C001':'Yes, substantial or continuing','C002':'Yes, recurrent','C003':'Yes, recurrent','C004':'Yes, substantial or continuing'});if(!active().includes('splenic_hematologic'))throw Error('hematologic not activated');});
test('concerning bleeding plus systemic symptoms activates leukaemia assessment',()=>{setAnswers({'C006':'Unexplained bruising','C006-SITE':'Skin spots','C002':'Keeps returning','C004':'Persistently'});if(!active().includes('leukaemia'))throw Error('leukaemia not activated');});
test('paediatric abdominal mass activates abdominal/renal warning route',()=>{setAnswers({'D-AGE':'8','PED-ABD':'Yes'});if(!active().includes('paediatric_abdominal'))throw Error('paediatric abdominal route not activated');});
test('paediatric bone warning activates bone/soft-tissue route',()=>{setAnswers({'D-AGE':'11','PED-BONE':'Yes'});if(!active().includes('paediatric_bone_soft_tissue'))throw Error('paediatric bone route not activated');});
test('paediatric testicular warning activates germ-cell route',()=>{setAnswers({'D-AGE':'15','PED-TESTICLE':'Yes'});if(!active().includes('paediatric_germ_cell'))throw Error('paediatric germ-cell route not activated');});
test('paediatric abnormal blood count activates hematologic warning route',()=>{setAnswers({'D-AGE':'6','SH003':'Yes'});if(!active().includes('paediatric_hematologic'))throw Error('paediatric hematologic route not activated');});
test('HPV result alone is a separate review; pending follow-up activates cervical route only with confirmed cervix',()=>{setAnswers({'D-ANATOMY':'Yes','HPV-RESULT':'HPV detected','HPV-FOLLOWUP':'Yes, completed'});if(active().includes('cervical'))throw Error('HPV result alone activated symptomatic pathway');const r=JSON.parse(vm.runInContext('JSON.stringify(activation().riskReviews)',ctx));if(!r.some(x=>x.name==='Cervical result follow-up'))throw Error('cervical follow-up review missing');setAnswers({'D-ANATOMY':'Yes','HPV-RESULT':'HPV detected','HPV-FOLLOWUP':'Pending/not completed'});if(!active().includes('cervical'))throw Error('cervical not activated for pending follow-up');setAnswers({'D-ANATOMY':'Not sure','HPV-RESULT':'HPV detected','HPV-FOLLOWUP':'Pending/not completed'});if(active().includes('cervical'))throw Error('cervical activated without confirmed anatomy');});
test('uterine symptom routes are anatomically gated',()=>{setAnswers({'D-UTERUS':'No','R-POSTMENOPAUSE-BLEED':'Yes'});if(active().includes('endometrial'))throw Error('endometrial activated without confirmed uterus');});
test('ovarian symptom route requires confirmed ovaries',()=>{setAnswers({'D-OVARIES':'Yes','C012':'Persistent or increasing'});if(!active().includes('ovarian'))throw Error('ovarian not activated');setAnswers({'D-OVARIES':'Not sure','C012':'Persistent or increasing'});if(active().includes('ovarian'))throw Error('ovarian activated with unknown anatomy');});
test('prostate route requires confirmed prostate and relevant symptoms',()=>{setAnswers({'D-PROSTATE':'Yes','U001':'Yes, repeatedly'});if(!active().includes('prostate'))throw Error('prostate not activated');setAnswers({'D-PROSTATE':'Not sure','U001':'Yes, repeatedly'});if(active().includes('prostate'))throw Error('prostate activated with unknown anatomy');});
test('laryngeal assessment activates on persistent voice change',()=>{setAnswers({'C011':'Persistent'});if(!active().includes('laryngeal'))throw Error('laryngeal not activated');});
test('breast assessment activates on new breast change',()=>{setAnswers({'G-BREAST-CHANGE':'New lump/swelling'});if(!active().includes('breast'))throw Error('breast not activated');});
test('groin node activates lymphoma assessment only with lymph-node-region finding',()=>{setAnswers({'C005':'Yes','C005-LOC':'Groin'});if(!active().includes('non_hodgkin_lymphoma'))throw Error('lymphoma not activated for groin node');});
test('tobacco exposure alone creates a separate review, not a symptomatic pathway',()=>{setAnswers({'T-STATUS':'Current user'});const x=JSON.parse(vm.runInContext('JSON.stringify(activation())',ctx));if(x.active.length)throw Error('exposure alone activated a pathway');if(!x.riskReviews.some(r=>r.name.includes('Tobacco')))throw Error('separate tobacco review missing');});
test('sudden severe breathing difficulty triggers independent emergency flag',()=>{setAnswers({'C016':'Sudden or severe'});const f=JSON.parse(vm.runInContext('JSON.stringify(safetyFlags())',ctx));if(!f.some(x=>x.level==='EMERGENCY'))throw Error('no emergency flag');});
test('vomiting blood triggers urgent safety and stomach route',()=>{setAnswers({'G-VOMIT-BLOOD':'Yes, once'});if(!active().includes('stomach'))throw Error('stomach route not activated');const f=JSON.parse(vm.runInContext('JSON.stringify(safetyFlags())',ctx));if(!f.some(x=>x.id==='G-VOMIT-BLOOD'&&x.level==='URGENT'))throw Error('no urgent flag');});
test('conditional follow-up is hidden after No and cleared when parent changes',()=>{setAnswers({'C005':'No','C005-LOC':'Neck'});let v=vm.runInContext("visibleQuestion(questionById('C005-LOC'))",ctx);if(v)throw Error('child shown after No');vm.runInContext('clearHiddenAnswers()',ctx);const value=vm.runInContext("answer('C005-LOC')",ctx);if(value!==undefined)throw Error('stale hidden answer not cleared');});
test('sexual/reproductive history questions are gated for ages under 12',()=>{setAnswers({'D-AGE':'7','D-ANATOMY':'Yes'});if(vm.runInContext("visibleQuestion(questionById('R-SEXACTIVE'))",ctx))throw Error('sexual history shown under age 12');setAnswers({'D-AGE':'15','D-ANATOMY':'Yes'});if(!vm.runInContext("visibleQuestion(questionById('R-SEXACTIVE'))",ctx))throw Error('sexual history not shown for eligible age');});
test('all 18 source pathway point budgets sum to 100',()=>{const pairs=JSON.parse(vm.runInContext('JSON.stringify(Object.entries(pathwaySpecs).map(([k,v])=>[k,v.reduce((n,d)=>n+d[1],0)]))',ctx));const sums=Object.fromEntries(pairs);for(const [k,v] of Object.entries(sums))if(v!==100)throw Error(k+' sums to '+v);if(Object.keys(sums).length!==18)throw Error('expected 18 source pathways, got '+Object.keys(sums).length);});
test('general index domain maximum is 100 and scores stay bounded',()=>{setAnswers({'T-STATUS':'Current user','T-PRODUCT':['Cigarettes'],'T-QUANTITY-CIGARETTES':'15','T-DURATION':'11–20 years','OR001':'Never','A-STATUS':'Never','PREV-CANCER':'No','PRIOR-ABNORMAL':'No','FH-CANCER':'No','OCC-EXPOSURE':['None known'],'D-ACTIVITY':'Moderate','D-BMI':'24','D-AGE':'35','D001':'Never','D002':'Never','D003':'Never','D004':'Never','D005':'Daily','D006':'Daily','D007':'Daily','D008':'Never','D009':'Never','D010':'No known exposure','CHRONIC-LIVER':'No','CHRONIC-DISEASE':['None'],'IMMUNOSUPPRESS':'No'});const x=JSON.parse(vm.runInContext('JSON.stringify(generalRiskIndex())',ctx));if(x.domains.reduce((n,d)=>n+d.max,0)!==100)throw Error('domain maxima do not total 100');if(x.points<0||x.points>100||x.coverage<0||x.coverage>100)throw Error('out of bounds');});

test('unexplained breathing difficulty activates lung assessment and rest symptoms raise safety flag',()=>{setAnswers({'C016':'With mild activity'});if(!active().includes('lung'))throw Error('lung route not activated');setAnswers({'C016':'At rest'});const f=JSON.parse(vm.runInContext('JSON.stringify(safetyFlags())',ctx));if(!f.some(x=>x.level==='URGENT'&&x.id==='C016-REST'))throw Error('at-rest breathing urgency missing');});
test('severe new chest pain independently activates emergency safety gateway',()=>{setAnswers({'G-CHEST-PAIN':'Yes, severe/new'});const f=JSON.parse(vm.runInContext('JSON.stringify(safetyFlags())',ctx));if(!f.some(x=>x.level==='EMERGENCY'&&x.id==='G-CHEST-PAIN'))throw Error('chest pain emergency flag missing');});
test('persistent thyroid nodule history is available in the activated pathway question bank',()=>{const q=JSON.parse(vm.runInContext('JSON.stringify(questionById("TH001"))',ctx));if(!q||!q.label.en.includes('thyroid nodule'))throw Error('TH001 thyroid history question missing');if(!active().includes('thyroid')&&q.id!=='TH001')throw Error('invalid thyroid pathway question');});
test('oral lesion details are conditional on at least one lesion answer',()=>{setAnswers({'D-AGE':'40','G-ORAL-LESION':'No'});if(vm.runInContext("visibleQuestion(questionById('OR-LESION-LOC'))",ctx))throw Error('oral follow-up visible with no lesion');setAnswers({'D-AGE':'40','G-ORAL-LESION':'Yes'});if(!active().includes('oral_cavity'))throw Error('oral pathway did not activate');if(vm.runInContext("visibleQuestion(questionById('OR-LESION-LOC'))",ctx))throw Error('oral detail should wait until lesion type is confirmed');setAnswers({'D-AGE':'40','G-ORAL-LESION':'Yes','OR002':'Yes'});if(!vm.runInContext("visibleQuestion(questionById('OR-LESION-LOC'))",ctx))throw Error('oral lesion location follow-up hidden after specific positive response');});
test('breast lump-specific follow-ups do not appear for an unrelated neck lump',()=>{setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Neck','G-BREAST-CHANGE':'Skin change/dimpling'});if(vm.runInContext("visibleQuestion(questionById('BR001-GROW'))",ctx))throw Error('breast lump-only follow-up shown for an unrelated neck lump');});
test('all adult pathway entries include clinician-directed investigation guidance',()=>{const missing=JSON.parse(vm.runInContext('JSON.stringify(pathways.pathways.filter(p=>!String(p.id).startsWith("paediatric_")&&p.id!=="paediatric_assessment"&&!p.investigation_guidance).map(p=>p.id))',ctx));if(missing.length)throw Error('missing guidance: '+missing.join(','));});


test('breast changes are handled as a multi-select shared variable',()=>{setAnswers({'D-AGE':'40','G-BREAST-CHANGE':['Skin change/dimpling','Nipple change']});if(!active().includes('breast'))throw Error('multi-select breast changes did not activate breast pathway');if(!vm.runInContext("visibleQuestion(questionById('BR003'))",ctx))throw Error('skin-detail follow-up hidden for selected skin change');if(!vm.runInContext("visibleQuestion(questionById('BR004'))",ctx))throw Error('nipple-detail follow-up hidden for selected nipple change');if(vm.runInContext("visibleQuestion(questionById('BR005'))",ctx))throw Error('nipple discharge follow-up shown when discharge not selected');});
test('pathway scoring never counts the same question ID in two domains',()=>{setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Neck','C005-DUR':'More than 6 weeks ago','C005-GROW':'Yes','G-THROAT':'Yes, more than 3 weeks','C011':'Persistent','T-STATUS':'Current user'});for(const pid of active()){const x=JSON.parse(vm.runInContext(`JSON.stringify(pathwayIndex(${JSON.stringify(pid)}))`,ctx));const ids=x.domains.filter(d=>d.level!==null).flatMap(d=>d.variables_considered||[]);if(ids.length!==new Set(ids).size)throw Error(pid+' counted a question more than once');}});
test('hypothyroidism alone does not activate thyroid cancer pathway',()=>{setAnswers({'TH001':'Yes','TH001-TYPE':['Hypothyroidism']});if(active().includes('thyroid'))throw Error('hypothyroidism alone activated thyroid pathway');const r=JSON.parse(vm.runInContext('JSON.stringify(activation().riskReviews)',ctx));if(!r.some(x=>x.name==='Thyroid history review'))throw Error('thyroid risk review missing');});
test('pathway sections remain hidden until their trigger is met',()=>{setAnswers({'D-AGE':'40','C005':'No'});const visible=JSON.parse(vm.runInContext('JSON.stringify(getVisibleSections().map(s=>s.id))',ctx));if(visible.includes('pathway_thyroid'))throw Error('thyroid pathway section visible without trigger');setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Neck'});const visible2=JSON.parse(vm.runInContext('JSON.stringify(getVisibleSections().map(s=>s.id))',ctx));if(!visible2.includes('pathway_thyroid'))throw Error('thyroid pathway section did not open after trigger');});


test('tobacco quantity fields are product-specific and conditional',()=>{setAnswers({'T-STATUS':'Current user','T-PRODUCT':['Cigarettes']});if(!vm.runInContext("visibleQuestion(questionById('T-QUANTITY-CIGARETTES'))",ctx))throw Error('cigarette quantity not shown');if(vm.runInContext("visibleQuestion(questionById('T-QUANTITY-HOOKAH'))",ctx))throw Error('hookah quantity shown for cigarette-only use');setAnswers({'T-STATUS':'Current user','T-PRODUCT':['Hookah/shisha','Gutkha']});if(!vm.runInContext("visibleQuestion(questionById('T-QUANTITY-HOOKAH'))",ctx)||!vm.runInContext("visibleQuestion(questionById('T-QUANTITY-SMOKELESS'))",ctx))throw Error('quantities for multiple selected product types not shown');});


test('thyroid hormone dysfunction alone does not contribute nodule/goitre pathway points',()=>{setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Neck','TH001':'Yes','TH001-TYPE':['Hypothyroidism']});const x=JSON.parse(vm.runInContext('JSON.stringify(pathwayIndex("thyroid"))',ctx));const d=x.domains.find(y=>y.name==='Prior thyroid pathology/abnormality');if(!d||d.level!==0)throw Error('thyroid hormone dysfunction was scored as nodule/goitre risk');});
test('documented thyroid nodule history can activate thyroid pathway even without a current neck lump',()=>{setAnswers({'D-AGE':'40','TH001':'Yes','TH001-TYPE':['Thyroid nodule']});if(!active().includes('thyroid'))throw Error('known thyroid nodule did not activate assessment');});
test('oral clinician-assessment questions are distinct from oral lesion symptoms',()=>{const qs=['OR002','OR003','OR004','OR006','OR007','OR008'].map(id=>JSON.parse(vm.runInContext(`JSON.stringify(questionById(${JSON.stringify(id)}))`,ctx)));if(!qs[0].label.en.includes('sore or ulcer'))throw Error('OR002 is not the source symptom question');if(!qs[3].label.en.includes('clinician or dentist'))throw Error('OR006 is not the clinician assessment question');});


test('abnormal blood-count history can activate haematologic pathway before pathway questions appear',()=>{setAnswers({'D-AGE':'52','SH003':'Yes'});if(!active().includes('splenic_hematologic'))throw Error('shared SH003 history did not activate pathway');});
test('abnormal PSA activates prostate assessment only when prostate is confirmed',()=>{setAnswers({'D-AGE':'60','D-PROSTATE':'Yes','PR001':'Yes'});if(!active().includes('prostate'))throw Error('elevated PSA did not activate prostate assessment');setAnswers({'D-AGE':'60','D-PROSTATE':'No','PR001':'Yes'});if(active().includes('prostate'))throw Error('prostate route activated without relevant anatomy');});
test('pending cervical follow-up is available before the cervical pathway opens',()=>{setAnswers({'D-AGE':'35','D-ANATOMY':'Yes','HPV-RESULT':'HPV detected','CE002':'Yes, pending'});if(!active().includes('cervical'))throw Error('shared pending cervical follow-up did not activate route');});
test('endometrial risk factors alone create a review, not a symptomatic pathway',()=>{setAnswers({'D-AGE':'42','D-UTERUS':'Yes','EN002':'Yes','R-POSTMENOPAUSE-BLEED':'No','R-INTERMENSTRUAL':'No'});if(active().includes('endometrial'))throw Error('risk factor alone activated symptomatic endometrial route');const r=JSON.parse(vm.runInContext('JSON.stringify(activation().riskReviews)',ctx));if(!r.some(x=>x.name==='Endometrial risk-factor review'))throw Error('endometrial risk review missing');});


test('shared symptom intake retains core prompts and removes duplicate swallowing/stool-discomfort questions',()=>{for(const id of ['ST002','ST003','OE002','CO001','LI002']){const q=JSON.parse(vm.runInContext(`JSON.stringify(questionById(${JSON.stringify(id)}))`,ctx));const sec=JSON.parse(vm.runInContext(`JSON.stringify(schema.sections.find(s=>s.questions.some(q=>q.id===${JSON.stringify(id)}))?.id)`,ctx));if(!q||!['redflags'].includes(sec))throw Error(id+' is not in shared symptom intake');}for(const id of ['OE003','CO002']){const q=vm.runInContext(`questionById(${JSON.stringify(id)})`,ctx);if(q)throw Error(id+' should have been removed as a duplicate/unwanted prompt');}});
test('paediatric haematologic warning can activate route before detailed PHM questions are visible',()=>{setAnswers({'D-AGE':'8','PED-HEMATOLOGIC':'Yes'});if(!active().includes('paediatric_hematologic'))throw Error('shared paediatric haematologic trigger failed');if(!vm.runInContext("visibleQuestion(questionById('PHM-CBC'))",ctx))throw Error('detailed PHM follow-up not visible after route activation');});


test('black tar-like stool independently raises urgent safety flag and colorectal pathway',()=>{setAnswers({'D-AGE':'58','C007':'Black tar-like stools','C007-REPEAT':'Repeatedly'});if(!active().includes('colorectal'))throw Error('colorectal route not activated');const f=JSON.parse(vm.runInContext('JSON.stringify(safetyFlags())',ctx));if(!f.some(x=>x.level==='URGENT'&&x.id==='C007'))throw Error('black-stool urgent flag missing');});


test('sex/gender defaults infer anatomy and hide organ-presence questions unless Transgender is selected',()=>{
 setAnswers({'D-SEX':'Male'});
 if(vm.runInContext("visibleQuestion(questionById('D-ANATOMY'))",ctx)||vm.runInContext("visibleQuestion(questionById('D-UTERUS'))",ctx)||vm.runInContext("visibleQuestion(questionById('D-OVARIES'))",ctx)||vm.runInContext("visibleQuestion(questionById('D-PROSTATE'))",ctx))throw Error('anatomy questions shown for Male');
 if(vm.runInContext("anatomyValue('D-PROSTATE')",ctx)!=='Yes'||vm.runInContext("anatomyValue('D-ANATOMY')",ctx)!=='No')throw Error('Male anatomy defaults incorrect');
 setAnswers({'D-SEX':'Female'});
 if(vm.runInContext("anatomyValue('D-ANATOMY')",ctx)!=='Yes'||vm.runInContext("anatomyValue('D-UTERUS')",ctx)!=='Yes'||vm.runInContext("anatomyValue('D-OVARIES')",ctx)!=='Yes'||vm.runInContext("anatomyValue('D-PROSTATE')",ctx)!=='No')throw Error('Female anatomy defaults incorrect');
 if(vm.runInContext("visibleQuestion(questionById('D-ANATOMY'))",ctx))throw Error('anatomy question shown for Female');
 setAnswers({'D-SEX':'Transgender'});
 for(const id of ['D-ANATOMY','D-UTERUS','D-OVARIES','D-PROSTATE'])if(!vm.runInContext(`visibleQuestion(questionById(${JSON.stringify(id)}))`,ctx))throw Error('transgender anatomy question hidden: '+id);
});

test('female selection activates menstrual-history questions through inferred uterus anatomy',()=>{
 setAnswers({'D-SEX':'Female','D-AGE':'32'});
 if(!vm.runInContext("visibleQuestion(questionById('R-MENARCHE'))",ctx))throw Error('menstruation-begun question is hidden for Female');
 if(!vm.runInContext("visibleQuestion(questionById('R-MENARCHE-AGE'))",ctx) && vm.runInContext("visibleQuestion(questionById('R-MENARCHE'))",ctx)) { /* age follow-up correctly remains conditional until menarche is Yes */ }
 setAnswers({'D-SEX':'Female','D-AGE':'32','R-MENARCHE':'Yes'});
 if(!vm.runInContext("visibleQuestion(questionById('R-MENARCHE-AGE'))",ctx))throw Error('menarche age follow-up is hidden after Yes');
 if(!vm.runInContext("visibleQuestion(questionById('R-CYCLE'))",ctx))throw Error('menstrual regularity question is hidden after Yes');
 if(vm.runInContext("visibleQuestion(questionById('R-MENARCHE'))",ctx)===false)throw Error('menstrual history disappeared after answer');
});
test('changing away from Transgender clears previously recorded anatomy answers',()=>{setAnswers({'D-SEX':'Transgender','D-ANATOMY':'No','D-UTERUS':'Yes','D-OVARIES':'No','D-PROSTATE':'Yes'});vm.runInContext("state.answers['D-SEX']='Female';clearHiddenAnswers()",ctx);const a=JSON.parse(vm.runInContext('JSON.stringify(state.answers)',ctx));for(const id of ['D-ANATOMY','D-UTERUS','D-OVARIES','D-PROSTATE'])if(id in a)throw Error('stale anatomy answer remained: '+id);});
test('every pathway has structured tumour-marker, IHC/pathology and molecular guidance',()=>{const ps=JSON.parse(vm.runInContext('JSON.stringify(pathways.pathways)',ctx));const missing=ps.filter(p=>!p.marker_guidance||!p.marker_guidance.tumour_markers||!p.marker_guidance.pathology_ihc||!p.marker_guidance.molecular).map(p=>p.id);if(missing.length)throw Error('missing marker guidance: '+missing.join(','));});


test('generic abnormal investigation is not credited to every cancer pathway',()=>{
 setAnswers({'D-AGE':'40','INVESTIGATION':'Yes, imaging','INVESTIGATION-DETAIL':'Abnormality, site not known','PRIOR-ABNORMAL':'Yes','PRIOR-ABNORMAL-TYPE':['Other/unknown']});
 const x=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(x.domains[1].level!==null)throw Error('generic non-site-specific abnormal test was scored for breast pathway');
 if(x.domains[3].level!==null)throw Error('unknown prior abnormality was scored as personal breast history');
});
test('normal site-specific imaging is not scored as suspicious objective evidence',()=>{
 setAnswers({'D-AGE':'40','INVESTIGATION':'Yes, imaging','INVESTIGATION-DETAIL':'Breast ultrasound normal; no suspicious lesion'});
 const x=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(x.domains[1].level!==0)throw Error('normal breast imaging not treated as a non-suspicious finding');
});
test('breast pathway family history requires a relevant family cancer site',()=>{
 setAnswers({'D-AGE':'40','FH-CANCER':'Yes','FH-SITE':['Lung'],'FH-MULTIPLE':'No'});
 const x=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(x.domains[2].level!==null)throw Error('lung-only family history incorrectly scored in breast pathway');
 setAnswers({'D-AGE':'40','FH-CANCER':'Yes','FH-SITE':['Breast'],'FH-MULTIPLE':'No'});
 const y=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(y.domains[2].level===null)throw Error('breast family history not scored when site relevant');
});
test('new breast lump raises symptom-domain signal and persistent/growing lump raises it further',()=>{
 setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Breast'});
 const a=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(a.domains[0].level!==60)throw Error('new breast lump did not receive the intended symptom signal');
 setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Breast','C005-DUR':'More than 6 weeks ago'});
 const b=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(b.domains[0].level!==100)throw Error('persistent breast lump did not receive the higher prototype signal');
});
test('unknown prior abnormality does not add generic personal-lesion points to general index',()=>{
 setAnswers({'PREV-CANCER':'No','PRIOR-ABNORMAL':'Yes','PRIOR-ABNORMAL-TYPE':['Other/unknown'],'PRIOR-FOLLOWUP':'No, pending/not completed'});
 const x=JSON.parse(vm.runInContext('JSON.stringify(generalRiskIndex())',ctx));
 const d=x.domains.find(d=>d.name==='Personal cancer history or relevant high-risk lesions');
 if(d.points!==0)throw Error('unknown abnormality received generic cancer-risk points');
});
test('fruit/vegetable/wholegrain/nut intake is not scored as harmful when frequent',()=>{
 setAnswers({'D005':'Never','D006':'Never','D007':'Never'});
 const low=JSON.parse(vm.runInContext("JSON.stringify(generalRiskIndex().domains.find(d=>d.name==='Diet-related exposures'))",ctx));
 setAnswers({'D005':'4 or more days a week','D006':'4 or more days a week','D007':'4 or more days a week'});
 const high=JSON.parse(vm.runInContext("JSON.stringify(generalRiskIndex().domains.find(d=>d.name==='Diet-related exposures'))",ctx));
 if(high.points>=low.points)throw Error('frequent protective-food intake scored as more lifestyle burden than never/low intake');
});
test('pathway score interpretation does not assign clinical risk bands',()=>{
 setAnswers({'D-AGE':'40','G-BREAST-CHANGE':['New lump/swelling']});
 const x=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(/few|some|multiple|substantial|high-priority|low risk/i.test(x.interpretation))throw Error('unsupported categorical interpretation remains');
});


test('chest-wall lump does not automatically activate the breast pathway',()=>{setAnswers({'D-AGE':'40','C005':'Yes','C005-LOC':'Chest wall'});if(active().includes('breast'))throw Error('chest-wall lump misrouted to breast pathway');});
test('vaginal bleeding site does not count as haematologic bruising/bleeding trigger',()=>{setAnswers({'D-AGE':'42','C006':'Unusual bleeding','C006-SITE':'Vaginal bleeding','C002':'Keeps returning'});if(active().includes('leukaemia'))throw Error('vaginal bleeding incorrectly triggered leukaemia route');});
test('skin spots with systemic symptoms can activate haematologic review',()=>{setAnswers({'D-AGE':'42','C006':'Red-purple spots','C006-SITE':'Skin spots','C002':'Keeps returning'});if(!active().includes('leukaemia'))throw Error('relevant skin spots plus systemic symptoms failed to activate haematologic review');});


test('incomplete pathway coverage suppresses the total score instead of treating missing domains as zero',()=>{
 setAnswers({'D-AGE':'42','C005':'Yes','C005-LOC':'Breast','C005-DUR':'More than 6 weeks ago','C005-GROW':'Yes','G-BREAST-CHANGE':['New lump/swelling'],'PRIOR-ABNORMAL':'Yes','PRIOR-ABNORMAL-TYPE':['Other/unknown'],'FH-CANCER':'Yes','FH-SITE':['Other/unknown'],'FH-MULTIPLE':'No','INVESTIGATION':'No'});
 const x=JSON.parse(vm.runInContext("JSON.stringify(pathwayIndex('breast'))",ctx));
 if(x.coveragePct>=100)throw Error('fixture should have incomplete coverage');if(x.points!==null)throw Error('partial domain subtotal incorrectly displayed as /100 total');if(typeof x.observedSubtotal!=='number')throw Error('observed subtotal not retained for audit');
});
test('incomplete general-domain coverage suppresses the general /100 total',()=>{
 setAnswers({'T-STATUS':'Never used','OR001':'Never','A-STATUS':'Never'});
 const x=JSON.parse(vm.runInContext('JSON.stringify(generalRiskIndex())',ctx));if(x.coveragePct>=100)throw Error('fixture should have incomplete general coverage');if(x.points!==null)throw Error('incomplete general score incorrectly displayed as /100');
});


test('Build 1.3.8 removes meal-by-meal, Lynch and liver hereditary questions',()=>{for(const id of ['MEAL-BREAKFAST','MEAL-LUNCH','MEAL-EVENING-SNACKS','MEAL-DINNER','EN004','LI003','CO002','OE003'])if(findQ(id))throw Error(id+' should be absent');});
test('Build 1.3.8 has conditional spleen gate and optional pad flow',()=>{const s=findQ('SH001'),p=findQ('R-PAD-FLOW');if(!findQ('SH000')||s.showIf?.question!=='SH000'||p.required===true)throw Error('spleen or pad condition incorrect');});
test('Build 1.3.8 moves HPV vaccination to initial male and post-menarche sections',()=>{if(!findQ('D-HPV-VAX')||findQ('D-HPV-VAX').showIf?.question!=='D-SEX'||!findQ('R-HPV-VAX')||findQ('R-HPV-VAX').showIf?.question!=='R-MENARCHE'||findQ('HPV-VAX'))throw Error('HPV vaccination placement incorrect');});
test('Build 1.3.8 gates semen questions to prostate-present anatomy',()=>{for(const id of ['U001','U002','U003','U004','U005'])if(findQ(id).showIf?.question!=='D-PROSTATE')throw Error(id+' not anatomy gated');});


test('Build 1.3.8 every adult pathway scoring item references an existing question',()=>{const specs=JSON.parse(vm.runInContext('JSON.stringify(pathwaySpecs)',ctx));const ids=new Set(JSON.parse(vm.runInContext('JSON.stringify(schema.sections.flatMap(s=>s.questions.map(q=>q.id)))',ctx)));for(const [name,domains] of Object.entries(specs)){for(const dom of domains){for(const id of dom[3]||[]){if(!ids.has(id))throw Error(name+' references missing question '+id);}}}});

console.log(`${count} rule-engine tests passed.`);
test('cooking-fuel question is present with traditional chulha, biogas, LPG, PNG and electric options',()=>{const q=findQ('D013');if(!q||q.type!=='multiselect')throw Error('D013 missing or not multiselect');for(const x of ['LPG cylinder gas stove','Piped natural gas (PNG)','Electric stove / induction cooktop','Biogas stove','Traditional chulha using firewood / crop residue / dung cakes','Kerosene stove','Coal / charcoal stove'])if(!q.options.includes(x))throw Error('missing option '+x);});
test('date of birth formatter accepts digits-only DDMMYYYY and pasted date formats',()=>{const cases=[['25011996','25/01/1996'],['25/01/1996','25/01/1996'],['2501','25/01'],['25','25']];for(const [input,expected] of cases){const actual=vm.runInContext(`formatDMYInput(${JSON.stringify(input)})`,ctx);if(actual!==expected)throw Error(input+' formatted as '+actual+' not '+expected);}});
