'use strict';
// Shared vocabulary/image projection. Existing main and input IDs deliberately remain distinct.
const PICTURE_WORDS=[
['cup','food','die Tasse','die Tassen','cup','杯子','bēizi','Ich möchte eine Tasse Kaffee.','I would like a cup of coffee.','我想要一杯咖啡。'],
['apple','food','der Apfel','die Äpfel','apple','苹果','píngguǒ','Der Apfel ist rot.','The apple is red.','这个苹果是红色的。'],
['bread','food','das Brot','die Brote','bread','面包','miànbāo','Ich esse Brot.','I eat bread.','我吃面包。'],
['water','food','das Wasser','—','water','水','shuǐ','Ich trinke Wasser.','I drink water.','我喝水。'],
['egg','food','das Ei','die Eier','egg','鸡蛋','jīdàn','Ich koche ein Ei.','I boil an egg.','我煮一个鸡蛋。'],
['banana','food','die Banane','die Bananen','banana','香蕉','xiāngjiāo','Die Banane ist gelb.','The banana is yellow.','香蕉是黄色的。'],
['chair','home','der Stuhl','die Stühle','chair','椅子','yǐzi','Der Stuhl steht hier.','The chair is here.','椅子在这里。'],
['book','home','das Buch','die Bücher','book','书','shū','Ich lese ein Buch.','I am reading a book.','我在看书。'],
['key','home','der Schlüssel','die Schlüssel','key','钥匙','yàoshi','Wo ist mein Schlüssel?','Where is my key?','我的钥匙在哪里？'],
['phone','home','das Handy','die Handys','mobile phone','手机','shǒujī','Das ist mein Handy.','This is my mobile phone.','这是我的手机。'],
['bed','home','das Bett','die Betten','bed','床','chuáng','Das Bett ist bequem.','The bed is comfortable.','这张床很舒服。'],
['clock','home','die Uhr','die Uhren','clock','时钟','shízhōng','Die Uhr hängt an der Wand.','The clock is on the wall.','时钟挂在墙上。'],
['car','travel','das Auto','die Autos','car','汽车','qìchē','Das Auto ist gelb.','The car is yellow.','这辆汽车是黄色的。'],
['bike','travel','das Fahrrad','die Fahrräder','bicycle','自行车','zìxíngchē','Ich fahre Fahrrad.','I ride a bicycle.','我骑自行车。'],
['bus','travel','der Bus','die Busse','bus','公共汽车','gōnggòng qìchē','Ich fahre mit dem Bus.','I take the bus.','我坐公共汽车。'],
['plane','travel','das Flugzeug','die Flugzeuge','airplane','飞机','fēijī','Das Flugzeug fliegt nach Hongkong.','The airplane is flying to Hong Kong.','飞机飞往香港。'],
['house','travel','das Haus','die Häuser','house','房子','fángzi','Das Haus hat eine Tür.','The house has a door.','这座房子有一扇门。'],
['tree','travel','der Baum','die Bäume','tree','树','shù','Der Baum ist grün.','The tree is green.','这棵树是绿色的。']
].map(([id,cat,de,plural,en,zh,pinyin,sde,sen,szh])=>({id,cat,de,plural,en,zh,pinyin,sde,sen,szh}));
const WILSON_VOCABULARY = (() => {
  const legacyByDe = new Map(PICTURE_WORDS.map(w => [w.de, w]));
  const originalInput = [["cup", "die Tasse", "die Tassen", "cup", "杯子", "bēizi"], ["apple", "der Apfel", "die Äpfel", "apple", "苹果", "píngguǒ"], ["bread", "das Brot", "die Brote", "bread", "面包", "miànbāo"], ["water", "das Wasser", "—", "water", "水", "shuǐ"], ["egg", "das Ei", "die Eier", "egg", "鸡蛋", "jīdàn"], ["banana", "die Banane", "die Bananen", "banana", "香蕉", "xiāngjiāo"], ["chair", "der Stuhl", "die Stühle", "chair", "椅子", "yǐzi"], ["book", "das Buch", "die Bücher", "book", "书", "shū"], ["key", "der Schlüssel", "die Schlüssel", "key", "钥匙", "yàoshi"], ["phone", "das Handy", "die Handys", "mobile phone", "手机", "shǒujī"], ["bed", "das Bett", "die Betten", "bed", "床", "chuáng"], ["clock", "die Uhr", "die Uhren", "clock", "时钟", "shízhōng"], ["car", "das Auto", "die Autos", "car", "汽车", "qìchē"], ["bike", "das Fahrrad", "die Fahrräder", "bicycle", "自行车", "zìxíngchē"], ["bus", "der Bus", "die Busse", "bus", "公共汽车", "gōnggòng qìchē"], ["plane", "das Flugzeug", "die Flugzeuge", "airplane", "飞机", "fēijī"], ["house", "das Haus", "die Häuser", "house", "房子", "fángzi"], ["tree", "der Baum", "die Bäume", "tree", "树", "shù"], ["junge", "der Junge", "die Jungen", "boy", "男孩", "nánhái"], ["kollege", "der Kollege", "die Kollegen", "colleague (male)", "男同事", "nán tóngshì"], ["eltern", "die Eltern", "die Eltern", "parents", "父母", "fùmǔ", "plural"], ["ferien", "die Ferien", "die Ferien", "holidays / vacation", "假期", "jiàqī", "plural"]];
  const originalIPA = {"die Tasse": "/ˈtasə/", "der Apfel": "/ˈapfəl/", "das Brot": "/bʁoːt/", "das Wasser": "/ˈvasɐ/", "das Ei": "/aɪ̯/", "die Banane": "/baˈnaːnə/", "der Stuhl": "/ʃtuːl/", "das Buch": "/buːx/", "der Schlüssel": "/ˈʃlʏsl̩/", "das Handy": "/ˈhɛndi/", "das Bett": "/bɛt/", "die Uhr": "/uːɐ̯/", "das Auto": "/ˈaʊ̯to/", "das Fahrrad": "/ˈfaːɐ̯ʁaːt/", "der Junge": "/ˈjʊŋə/", "der Kollege": "/kɔˈleːɡə/", "die Eltern": "/ˈɛltɐn/", "die Ferien": "/ˈfeːʁi̯ən/", "der Bus": "/bʊs/", "das Flugzeug": "/ˈfluːktsɔʏ̯k/", "das Haus": "/haʊ̯s/", "der Baum": "/baʊ̯m/"};
  const reviewed = new Map(WILSON_IMAGE_CANDIDATES.filter(w => w.active && w.review?.decision === 'approved').map(w => [w.id, w]));
  const originals = new Map(originalInput.map(row => [row[1], row]));
  const lexiconIDs = new Set(LEXICON.map(w=>w.id));
  const base = [...LEXICON,...WILSON_IMAGE_CANDIDATES.filter(w=>!lexiconIDs.has(w.id) && w.de && w.en)];
  const words = base.map(w => {
    const candidate = reviewed.get(w.id), row = originals.get(w.de);
    const patch = candidate ? {...Object.fromEntries(['de','plural','en','zh','pinyin','pos','cat','articleVariants'].filter(k=>candidate[k]!==undefined).map(k=>[k,candidate[k]])),...candidate.review.corrections} : {};
    const task = candidate?.review?.task || null;
    const plural = (patch.pos || w.pos)==='plural' && (patch.plural ?? w.plural)==='—' ? (patch.de || w.de) : (patch.plural ?? w.plural);
    return {...w, ...patch, plural, ...(row ? {de:row[1],plural:row[6]==='plural'?row[1]:row[2],en:row[3],zh:row[4],pinyin:row[5]} : {}),
      task,
      context: candidate?.review?.context || null,
      answerVariants: candidate?.review?.answerVariants || [],
      numberMode: row?.[6] || ((patch.pos || w.pos)==='plural'?'plural':plural==='—'?'singular':'both'),
      imagePath: row ? 'wilson/'+row[0]+'.svg' : candidate?.path || '',
      imageCredit: row ? null : candidate || null,
      ipa: originalIPA[w.de] || candidate?.review?.ipa || '',
      nDeclension: patch.nDeclension ?? ['der Junge','der Kollege','der Kunde','der Student','der Mensch','der Herr','der Nachbar','der Polizist','der Geldautomat','der Bär','der Ameisenbär','der Elefant','der Hase','der Löwe','der Leopard','der Schimpanse'].includes(w.de),
      childSuitable: row ? !['der Kollege','die Ferien','die Eltern'].includes(w.de) : (candidate?.review?.childSuitable ?? candidate?.childSuitable) === true,
      picture: !!(row || candidate)
    };
  });
  // A few original words were never in the lexicon (e.g. Ferien). Keep their IDs.
  for (const row of originalInput) if (!words.some(w=>w.de===row[1])) {
    words.push({id:row[0],de:row[1],plural:row[6]==='plural'?row[1]:row[2],en:row[3],zh:row[4],pinyin:row[5],
      pos:row[6]==='plural'?'plural':'noun',cat:'family',articleVariants:[],
      numberMode:row[6]||'both',ipa:originalIPA[row[1]],nDeclension:false,
      imagePath:'wilson/'+row[0]+'.svg',imageCredit:null,picture:true,childSuitable:false});
  }
  const inputWords = originalInput.map(row => {
    const w=words.find(w=>w.de===row[1]);
    // v1 input used a fallback ID for plural-only words; never replace it with a lexicon ID.
    const oldSource=LEXICON.find(w=>w.de===row[1] && w.pos==='noun');
    return {...w,id:oldSource?.id || row[0]};
  });
  for (const w of words) if (w.picture && !originals.has(w.de)) inputWords.push({...w});
  // Main-app original IDs and example sentences are also preserved exactly.
  const mainWords=words.map(w=>({...w,...(legacyByDe.get(w.de)||{})}));
  return {words, inputWords, mainWords, originalCount:originalInput.length,
    activeCount:inputWords.length, target:1500};
})();
