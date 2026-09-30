/* Course content, shared by every design. Plain data, no logic.
   Taken from english-coach-beginner.html, plus the parts that used to live inside views
   (guide, watching advice, solo texts) and two new pieces: SWAP and MILESTONES. */

/* ============ video ============ */
const VID = [
 {from:1, n:"Comprehensible English", w:"Zero level",
  d:"Built for true beginners. Meaning comes from drawings, objects and gesture, so he needs no subtitles and no translation. Start here.",
  u:"https://www.youtube.com/@ComprehensibleEnglish"},
 {from:1, n:"Learn English with Bob the Canadian", w:"Zero level",
  d:"Speaks slowly, articulates every syllable, films in real kitchens and garages so the objects are on screen. Search YouTube by name."},
 {from:1, n:"His Warhammer games, switched to English", w:"Warhammer",
  d:"The real win — he plays anyway, so every hour converts. Total War: Warhammer III is the best starting point: pausable campaign, short unit cards, the same vocabulary repeating across hundreds of hours. Darktide and Space Marine 2 have short voice lines he'll hear five hundred times, which is exactly how phrases stick."},
 {from:1, n:"LEGO official channel", w:"LEGO",
  d:"Designer videos and speed builds. A preposition machine — on, in, under, next to, on top of, behind — which is exactly his first three months of vocabulary."},
 {from:1, n:"ChrisFix", w:"Cars",
  d:"Breaks every repair into small steps, close-ups of every tool and part, and deliberately avoids technical jargon. Search YouTube by name."},
 {from:1, n:"Other games, in English", w:"Games",
  d:"Same principle. Slow, text-heavy, pausable games work; anything with time pressure just makes him panic and switch the language back."},
 {from:8, n:"BBC Learning English", w:"Structured",
  d:"Many different presenters in clear British English, very short formats. 'English in a Minute' teaches one thing per video."},
 {from:8, n:"VOA Learning English", w:"Structured",
  d:"News read at reduced speed with subtitles, American English. He needs both accents, not just one."},
 {from:16, n:"Easy English", w:"Many voices",
  d:"Street interviews in Brighton, dozens of different speakers, English subtitles on every episode. This is the cure for only-understands-you. Their Slow Easy English episodes come a bit earlier.",
  u:"https://www.youtube.com/c/EasyEnglishVideos"},
 {from:16, n:"Warhammer lore — not yet", w:"The destination",
  d:"Genuinely hard English: dense, fast, deliberately archaic, full of invented proper nouns, with no visual referent. He'd understand about five percent, which teaches nothing and feels like failing. Realistically watchable around B1, roughly a year in. Tell him that — a finish line he actually wants beats any progress bar."},
 {from:16, n:"Rogue Trader (Owlcat)", w:"Warhammer",
  d:"Enormously text-heavy but entirely self-paced, so it becomes good input once he has a few hundred words. Around month six."},
 {from:16, n:"Полиглот: 16 часов (Дмитрий Петров)", w:"In Russian",
  d:"The Kultura TV course. Genuinely good at drilling basic verb structures to automaticity, and culturally familiar. But it is not listening practice — he's listening to Russian. Cap all Russian-explained video at a fifth of his watching time."}
];

/* ============ weeks ============ */
const W = [
 {t:"Hello, I'm…", cando:["My name is Dima. Nice to meet you.","Меня зовут Дима. Приятно познакомиться."],
  why:"Start with his own name and yours. The first thing he says in English should be true and about him.",
  sound:"Letter names, for spelling his own name aloud — not for reading. Check for the Cyrillic trap first: В Р С Н Х У exist in both alphabets with different sounds. Ten minutes, then move on. And /h/, much softer than Russian х.",
  ph:[["Hello.","Привет."],["Good morning.","Доброе утро."],["My name is ___.","Меня зовут ___."],
      ["I'm ___.","Я ___."],["What's your name?","Как тебя зовут?"],["Nice to meet you.","Приятно познакомиться."],
      ["Thank you.","Спасибо."],["Sorry.","Извини."],["Goodbye.","До свидания."],["See you.","Увидимся."],
      ["How do you spell that?","Как это пишется?"],["D-I-M-A.","Д-И-М-А."]],
  hw:"Say the ten phrases out loud, twice a day, from the recording. And spell his own name aloud until it's automatic."},

 {t:"Where I'm from", cando:["I'm from Russia. I live in Helsinki.","Я из России. Я живу в Хельсинки."],
  why:"Countries and cities are nearly free — most sound similar in both languages. Cheap early wins matter a lot right now.",
  sound:"th — /θ/ in three, /ð/ in this. Tongue visible between the teeth. Do not let him say sri or zis.",
  ph:[["I'm from Russia.","Я из России."],["I live in Helsinki.","Я живу в Хельсинки."],
      ["Where are you from?","Откуда ты?"],["Where do you live?","Где ты живёшь?"],
      ["This is my friend.","Это мой друг."],["He's from Moscow.","Он из Москвы."],
      ["She's from Finland.","Она из Финляндии."],["I speak Russian.","Я говорю по-русски."],
      ["A little.","Немного."],["I don't understand.","Я не понимаю."]],
  hw:"Numbers 1–20, out loud, every day. And the ten phrases."},

 {t:"am, is, are", cando:["I'm tired. It's cold. Are you OK?","Я устал. Холодно. Ты в порядке?"],
  why:"The most important structural thing in the first three months. Russian drops the verb 'to be' in the present — 'он врач', 'она красивая'. English never does. If he leaves it out now it becomes permanent.",
  sound:"Contractions. I'm, he's, it's, they're. Nobody says 'I am' in speech.",
  ph:[["I'm tired.","Я устал."],["I'm hungry.","Я голодный."],["It's cold.","Холодно."],
      ["It's good.","Это хорошо."],["He's my brother.","Он мой брат."],["She's a doctor.","Она врач."],
      ["We're at home.","Мы дома."],["They're my friends.","Они мои друзья."],
      ["Are you OK?","Ты в порядке?"],["Yes, I am. / No, I'm not.","Да. / Нет."]],
  hw:"Ten sentences about real people he knows, using is or are."},

 {t:"I have / I don't have", cando:["I have two brothers. I don't have a car.","У меня два брата. У меня нет машины."],
  why:"Russian says 'у меня есть'. English uses a normal verb. Also his first meeting with don't — teach it as one word, not as do + not.",
  sound:"v, not w. have, live, love, very. Teeth on the lip.",
  ph:[["I have a car.","У меня есть машина."],["I don't have time.","У меня нет времени."],
      ["I have two brothers.","У меня два брата."],["Do you have a phone?","У тебя есть телефон?"],
      ["Yes, I do. / No, I don't.","Да. / Нет."],["My mother.","Моя мама."],["My wife.","Моя жена."],
      ["My son. My daughter.","Мой сын. Моя дочь."],["How old are you?","Сколько тебе лет?"],
      ["I'm thirty-five.","Мне тридцать пять."]],
  hw:"Describe his family out loud. Five sentences. Record it on his phone and send it to you."},

 {t:"I want, I need, I'd like", cando:["I'd like a coffee, please. How much is it?","Кофе, пожалуйста. Сколько стоит?"],
  why:"The first phrases he can use outside the room. Teach 'I'd like' as one unbreakable block — do not explain would. That comes in a year.",
  sound:"w — rounded lips, no teeth. want, water, work, would.",
  ph:[["I want to eat.","Я хочу есть."],["I need help.","Мне нужна помощь."],
      ["I'd like a coffee, please.","Кофе, пожалуйста."],["Can I have the bill?","Можно счёт?"],
      ["How much is it?","Сколько стоит?"],["Excuse me.","Извините."],
      ["Where is the toilet?","Где туалет?"],["One moment.","Минуту."],
      ["Yes, please. / No, thank you.","Да, пожалуйста. / Нет, спасибо."],["That's all.","Это всё."]],
  hw:"Buy one thing in English this week. A coffee counts. That's the whole homework."},

 {t:"I like, I don't like", cando:["I like coffee but I don't like winter.","Я люблю кофе, но не люблю зиму."],
  why:"Opinions are the first thing that make conversation feel like conversation rather than an exercise.",
  sound:"The -s ending: he likes, she wants. Russian speakers drop it for years. Start early.",
  ph:[["I like coffee.","Я люблю кофе."],["I don't like winter.","Я не люблю зиму."],
      ["I love this.","Мне это очень нравится."],["I hate it.","Ненавижу."],
      ["Do you like fish?","Ты любишь рыбу?"],["He likes football.","Он любит футбол."],
      ["It's OK.","Нормально."],["Really?","Правда?"],["Me too.","Я тоже."],["I agree.","Согласен."]],
  hw:"Ten things he likes, ten he doesn't. Out loud, recorded, sent to you."},

 {t:"My day", cando:["I get up at seven and I go to work.","Я встаю в семь и иду на работу."],
  why:"Present simple, I/you/we only. Don't touch he/she endings beyond what he met last week.",
  sound:"/ɪ/ vs /iː/ — live/leave, sit/seat, it/eat. Length and tongue position.",
  ph:[["I get up at seven.","Я встаю в семь."],["I go to work.","Я иду на работу."],
      ["I work in a shop.","Я работаю в магазине."],["I eat at home.","Я ем дома."],
      ["I go to bed at eleven.","Я ложусь спать в одиннадцать."],["Every day.","Каждый день."],
      ["On Monday.","В понедельник."],["In the morning.","Утром."],
      ["At the weekend.","На выходных."],["What time is it?","Который час?"]],
  hw:"Describe his whole day, out loud, every morning this week."},

 {t:"do and don't", cando:["What do you do? Where do you work?","Кем ты работаешь? Где ты работаешь?"],
  why:"The hardest thing in these twelve weeks. Russian has no auxiliary — questions are made with intonation alone. Expect this to take a month, not a week. Come back to it constantly.",
  sound:"'Do you' becomes d'you in real speech. Teach the real version.",
  ph:[["Do you work?","Ты работаешь?"],["What do you do?","Кем ты работаешь?"],
      ["Where do you work?","Где ты работаешь?"],["When do you start?","Когда ты начинаешь?"],
      ["I don't work on Sunday.","Я не работаю в воскресенье."],["I don't know.","Я не знаю."],
      ["Do you understand?","Ты понимаешь?"],["What does it mean?","Что это значит?"],
      ["How do you say ___ in English?","Как сказать ___ по-английски?"],["Can you repeat that?","Повтори, пожалуйста."]],
  hw:"Write ten questions to ask you. Ask them out loud next session."},

 {t:"can and can't", cando:["Can you help me? I can drive but I can't swim.","Можешь помочь? Я вожу машину, но не умею плавать."],
  why:"One form for every person — no endings to learn. A rest week after the do/don't fight, and immediately useful.",
  sound:"can't. Short, clipped. Practise can / can't as a pair until he hears the difference.",
  ph:[["I can drive.","Я вожу машину."],["I can't swim.","Я не умею плавать."],
      ["Can you help me?","Можешь мне помочь?"],["Can I ask you something?","Можно спросить?"],
      ["I can speak a little English.","Я немного говорю по-английски."],
      ["Can you speak slowly, please?","Говорите медленнее, пожалуйста."],
      ["I can't hear you.","Я тебя не слышу."],["Of course.","Конечно."],
      ["No problem.","Без проблем."],["Maybe.","Может быть."]],
  hw:"Five things he can do, five he can't. And ask one real person for help in English."},

 {t:"was and were", cando:["I was at home yesterday. It was good.","Я был дома вчера. Было хорошо."],
  why:"The past starts here, with the verb he already knows best. Only two forms to learn.",
  sound:"was is weak in speech — /wəz/, not /was/. He'll want to say it fully. Don't let him.",
  ph:[["I was at home.","Я был дома."],["It was good.","Было хорошо."],
      ["It was very cold.","Было очень холодно."],["We were tired.","Мы устали."],
      ["Where were you?","Где ты был?"],["I wasn't there.","Меня там не было."],
      ["Yesterday.","Вчера."],["Last week.","На прошлой неделе."],
      ["Two days ago.","Два дня назад."],["How was it?","Как было?"]],
  hw:"Say where he was and how it was, every day this week. Recorded."},

 {t:"Yesterday I…", cando:["Yesterday I went to work and I saw my friend.","Вчера я ходил на работу и видел друга."],
  why:"Twenty irregular past forms. Teach them as twenty separate words to memorise, not as a rule — because they aren't one.",
  sound:"-ed has three sounds: worked /t/, lived /d/, wanted /ɪd/. He doesn't need the rule, just the imitation.",
  ph:[["I went.","Я пошёл."],["I had.","У меня было."],["I did.","Я сделал."],["I saw.","Я видел."],
      ["I ate.","Я ел."],["I said.","Я сказал."],["I made.","Я сделал."],["I got.","Я получил."],
      ["Yesterday I went to work.","Вчера я ходил на работу."],["It was a good day.","Это был хороший день."]],
  hw:"Every evening: three sentences about what he did today. Recorded, sent to you."},

 {t:"Plans, and looking back", cando:["I'm going to see my friend tomorrow.","Я собираюсь увидеться с другом завтра."],
  why:"Last week. One new structure, then spend most of the time proving to him how far he's come.",
  sound:"'going to' becomes gonna in speech. He should recognise it, even if he says the full form.",
  ph:[["I'm going to work tomorrow.","Завтра я иду на работу."],["What are you going to do?","Что ты будешь делать?"],
      ["Next week.","На следующей неделе."],["I don't know yet.","Я ещё не знаю."],
      ["Maybe I'll come.","Может быть, приду."],["See you on Friday.","Увидимся в пятницу."],
      ["I'm learning English.","Я учу английский."],["I started in ___.","Я начал в ___."],
      ["It's difficult but it's interesting.","Трудно, но интересно."],["I can do this.","Я могу это сделать."]],
  hw:"Record three minutes about himself. Compare it with week one. Then choose what comes next, together."}
];

/* ============ session types ============ */
const SESS = {
 a:{name:"New phrases", blocks:[
  {t:"What he already knows", m:4, body:`<ul><li>Run through last week's phrases, fast. You say the Russian, he says the English.</li>
    <li>Anything he hesitates on, say it for him and move on. No drilling here.</li></ul>`, prev:true},
  {t:"The new phrases", m:8, body:`<ul><li>Read each phrase. Say the Russian. Say the English twice.</li>
    <li>Explain in Russian if he asks. Keep explanations under thirty seconds.</li>
    <li>Don't break the phrases apart into grammar. They're single units this week.</li></ul>`, ph:true, why:true},
  {t:"Repeat after me", m:6, body:`<ul><li>You say it, he repeats. Ten times each, not three.</li>
    <li>Normal speed, not slow — slow English teaches him a version nobody speaks.</li>
    <li>Correct pronunciation here and nowhere else today.</li></ul>`, sound:true},
  {t:"Record it", m:3, body:`<ul><li>Your voice, every new phrase, one tap each on the record button. Normal speed.</li>
    <li>He listens to this during the week and his cards play it. This is what replaces a textbook's audio CD.</li>
    <li>Nothing to send: each recording goes to his phone by itself when he next has internet.</li></ul>`, rec:true},
  {t:"Swap the words", m:5, body:`<ul><li>Same sentence, change one word. "I like coffee" → tea, winter, football, my job.</li>
    <li>Fast, twenty times. He should stop thinking and start producing.</li></ul>`, swap:true},
  {t:"Homework", m:2, body:`<ul><li>Set it, then stop. Beginners get tired much faster than you expect.</li></ul>`, hw:true}
 ]},
 b:{name:"Drill", blocks:[
  {t:"Everything so far", m:4, body:`<ul><li>Russian → English, fast, this week's phrases and last week's.</li></ul>`, prev:true},
  {t:"Swap the words, faster", m:7, body:`<ul><li>Same drill as last time but quicker, and you choose the replacements.</li>
    <li>Aim for no pause between your prompt and his answer.</li></ul>`, ph:true, swap:true},
  {t:"Listening", m:6, body:`<ul><li>You say a phrase in English. He says what it means, in Russian.</li>
    <li>Then mix in phrases he doesn't know and let him guess from context. Guessing is a skill.</li>
    <li>Speak at normal speed. Repeat, don't slow down.</li></ul>`},
  {t:"Sounds", m:5, body:`<ul><li>Ten repetitions of this week's sound. He records himself and plays it back.</li></ul>`, sound:true},
  {t:"A small situation", m:4, body:`<ul><li>Act out one tiny scene using this week's phrases. Thirty seconds, twice.</li>
    <li>Swap roles the second time.</li></ul>`, cando:true}
 ]},
 c:{name:"Use it", blocks:[
  {t:"Everything, cold", m:5, body:`<ul><li>All the phrases he's ever learned, in random order, Russian → English.</li>
    <li>Tick off the ones he gets instantly in the phrase bank.</li></ul>`, prev:true, cold:true},
  {t:"Real conversation", m:8, body:`<ul><li>Talk to him in English using only what he knows. Ask real questions about his real life.</li>
    <li>He will be slow. Wait. Do not fill the silence — this is the whole exercise.</li>
    <li>Russian is allowed when he's stuck, then straight back to English.</li></ul>`, cando:true},
  {t:"Question and answer", m:6, body:`<ul><li>You ask, he answers. Then he asks, you answer.</li>
    <li>Twenty exchanges. Speed matters more than accuracy today.</li></ul>`},
  {t:"Update the bank", m:4, body:`<ul><li>Open the phrase bank and tick what he can now say without thinking.</li>
    <li>Show him the number. This is the part that keeps him going.</li></ul>`, tab:"bank"},
  {t:"Next week", m:3, body:`<ul><li>Tell him what's coming and why it's useful. One sentence.</li>
    <li>Confirm the next two session times before he leaves.</li></ul>`, hw:true, plan:true}
 ]}
};

/* ============ solo work, for him, on the road ============ */
const ROAD = [
 "Здоровайся про себя с каждым, кто входит: Hello. Good morning. И продиктуй своё имя по буквам вслух, пока едешь.",
 "Про каждого человека вокруг придумай, откуда он: He's from Moscow. She's from Finland. И про себя: I'm from Russia.",
 "Говори про всё, что видишь за окном: It's cold. It's big. He's tired. Главное, не проглатывай is. По-русски его нет, по-английски без него нельзя.",
 "Перечисли вслух, что у тебя в карманах и в сумке: I have a phone. I have keys. Потом чего нет: I don't have a car.",
 "В каждом месте, мимо которого проезжаешь, мысленно закажи себе кофе: I'd like a coffee, please. How much is it?",
 "Всё, что попадается на глаза, дели на две кучи: I like this. I don't like this. Не думай, отвечай сразу.",
 "Расскажи свой день по порядку, от I get up at seven до I go to bed at eleven. Каждый раз, когда сел в транспорт.",
 "Придумывай вопросы людям вокруг, отвечать всё равно никто не будет: Where do you work? Do you have a car? What do you do?",
 "Про каждого, кого видишь: что он умеет? He can drive. She can cook. Потом пять раз про себя I can и пять раз I can't.",
 "Каждый вечер три предложения: где ты был и как было. I was at home. It was cold. It was good.",
 "Перед сном три предложения про сегодня: I went… I saw… I ate… Слова нет, пропусти, в переводчик не лезь.",
 "Что будет завтра и на следующей неделе: I'm going to… И один раз вслух, громко: I can do this."
];

const EX = [
 {g:"С записью в телефоне", id:"rep", n:"Повторяй за записью", m:"5–10 минут · запись, лучше наушники",
  d:["Включи запись с последнего занятия. После каждой фразы ставь паузу и говори её вслух. Не три раза, а десять. Одна фраза десять раз даёт больше, чем десять фраз по разу.",
     "Вокруг люди и говорить неудобно? Проговаривай губами, без голоса. Это хуже, чем вслух, но намного лучше, чем просто слушать."]},
 {g:"С записью в телефоне", id:"finish", n:"Досказывай сам", m:"5 минут · запись",
  d:["Включай фразу и жми паузу после первого слова. Договори до конца сам, потом отпусти паузу и проверь, совпало ли.",
     "Это единственный способ поймать себя на ошибке, когда рядом никого нет."]},
 {g:"С записью в телефоне", id:"listen", n:"Просто слушай", m:"10 минут · запись",
  d:["Поставь запись по кругу и смотри в окно. Не переводи, не повторяй, не напрягайся.",
     "Фоном английский обычно бесполезен, но тут случай особый: каждую фразу ты уже знаешь наизусть, и остаётся только привыкнуть к звуку."]},

 {g:"Ничего не нужно", id:"count", n:"Считай всё подряд", m:"2 минуты · сколько угодно раз в день",
  d:["Номера машин, этажи, двери, ступеньки, люди в очереди, цены на ценниках. Вслух или про себя, по-английски.",
     "Первые недели хватит 1–20, дальше считай до ста."]},
 {g:"Ничего не нужно", id:"name", n:"Называй, что видишь", m:"5 минут", road:true,
  d:["Бери фразу этой недели и подставляй в неё всё, что попадается на глаза. Двадцать раз одна и та же конструкция, разные слова. Стало скучно, значит делаешь правильно."]},
 {g:"Ничего не нужно", id:"around", n:"Английский вокруг", m:"5 минут",
  d:["В больнице, в поезде и в магазине английского больше, чем кажется: упаковки, приборы, кнопки, бренды, надписи на футболках. Найди пять надписей и прочитай вслух, как думаешь.",
     "Одну запомни и спроси на занятии, как она читается на самом деле. Читать самому и ошибаться нормально. Проверять обязательно."]},
 {g:"Ничего не нужно", id:"ask", n:"Собирай вопросы", m:"пока едешь",
  d:["Рассказывай про себя по-английски теми словами, что есть. Там, где застрял, не лезь в переводчик, а наговори себе голосовое по-русски: как сказать то-то.",
     "К занятию у тебя будет свой список вопросов. Это лучшее, что можно принести с дороги."]},
 {g:"Ничего не нужно", id:"voice", n:"Голосовое раз в день", m:"1 минута · обязательно",
  d:["Одна минута английского голосовым сообщением, каждый день, даже если это просто фразы недели подряд.",
     "Это единственное из всей страницы, что нельзя пропускать. Остальное по настроению."]},

 {g:"В телефоне", id:"cards", n:"Карточки", m:"5–15 минут · работает без интернета", cards:true,
  d:["Каждый день приходит своя стопка: пять новых фраз и те, что пора повторить. Прошёл стопку, на сегодня всё.",
     "Тридцати секунд свободного времени уже хватает на пару карточек."]},
 {g:"В телефоне", id:"games", n:"Игры на слух", m:"3–5 минут · без интернета", games:true,
  d:["Угадай по звуку, собери фразу из слов, повтори эхом за учителем. Только фразы, которые уже были на занятии.",
     "Когда на карточки нет сил, а пять минут есть."]},
 {g:"В телефоне", id:"duo", n:"Duolingo", m:"10 минут · когда нет сил на остальное",
  d:["Лучше, чем ноль, и хуже, чем всё остальное на этой странице. Держи как запасной вариант, а не как основной."]}
];

const WRU = ["Привет, меня зовут…","Откуда я","Связка: am, is, are","У меня есть, у меня нет",
 "Хочу, мне нужно, я бы хотел","Нравится, не нравится","Мой день","Вопросы: do и don't",
 "Умею и не умею: can, can't","Прошлое: was, were","Вчера я…","Планы и итоги"];

/* ============ swap the words: one frame, many fillers, per week (teacher-facing) ============ */
const SWAP = [
 [{f:"Good ___.", w:["morning","afternoon","evening","night"]},
  {f:"Nice to meet you, ___.", w:["Anna","Max","Sasha","Olga","Tom"]}],
 [{f:"I'm from ___.", w:["Russia","Finland","Moscow","Helsinki","Estonia","England"]},
  {f:"I live in ___.", w:["Helsinki","a flat","a house","the city centre"]}],
 [{f:"It's ___.", w:["cold","hot","good","bad","big","small","expensive","cheap"]},
  {f:"I'm ___.", w:["tired","hungry","cold","OK","happy","busy"]}],
 [{f:"I have a ___.", w:["car","phone","brother","sister","dog","cat","bike"]},
  {f:"I don't have ___.", w:["time","money","a car","a dog","a phone"]}],
 [{f:"I'd like a ___, please.", w:["coffee","tea","water","sandwich","ticket","bag"]},
  {f:"Where is the ___?", w:["toilet","station","bus stop","shop","hospital","exit"]}],
 [{f:"I like ___.", w:["coffee","tea","football","cars","LEGO","Warhammer","video games"]},
  {f:"I don't like ___.", w:["winter","fish","rain","mornings","my job"]}],
 [{f:"I get up at ___.", w:["six","seven","eight","nine","ten"]},
  {f:"I go to ___.", w:["work","bed","the shop","the gym","the doctor"]}],
 [{f:"Do you ___?", w:["work","drive","cook","play games","like coffee","have a car"]},
  {f:"Where do you ___?", w:["work","live","eat","play","buy LEGO"]}],
 [{f:"I can ___.", w:["drive","cook","swim","run","play chess","speak Russian"]},
  {f:"Can you ___?", w:["help me","repeat that","speak slowly","drive","wait"]}],
 [{f:"I was ___.", w:["at home","at work","at the shop","tired","busy","happy"]},
  {f:"It was ___.", w:["good","bad","cold","OK","great","boring"]}],
 [{f:"Yesterday I ___.", w:["went to work","saw my friend","ate pizza","played games","had a coffee","made dinner"]}],
 [{f:"I'm going to ___.", w:["work tomorrow","see my friend","play games","buy a car","cook dinner","learn English"]}]
];

/* ============ counts worth marking. The bank number is the motivator; these are its milestones. ============ */
const MILESTONES = [5, 10, 25, 50, 75, 100, 125];

/* ============ this week, teacher-facing ============ */
const RULE_RU = "Russian for explaining, English for doing. Explain in Russian, then stop — the drilling, the repeating and the answering all happen in English. Keep any explanation under thirty seconds.";
const TICK_RULE = "Tick a phrase only when he can say it with no pause and no thinking. Not when he understands it.";
/* between sessions. `from` gates an item by week index (0-based). {hw} is replaced by the week's homework. */
const BETWEEN = [
 {b:"The recording.", x:"{hw}"},
 {b:"Daily voice note.", x:"One minute in English, sent to you. At this level it can be just the week's phrases. You reply with corrections when it suits you."},
 {b:"Cards, five new a day.", x:"In his app, on the Карточки screen. Anki-style: every card comes back just before he would forget it, and your voice plays on the back. Ten to fifteen minutes, never more."},
 {b:"Duolingo, 10 minutes.", x:"Genuinely fine at this level, free, and needs no study skills. It stops being enough in about six months. That's a problem for later."},
 {b:"A graded reader, with the audio.", x:"Oxford Bookworms Starter or Penguin Easystarts — about 250 words of vocabulary, 24 pages, illustrated. He listens and reads at the same time, never one without the other. Five books at this level before moving up.", from:7}
];

/* ============ watching, teacher-facing ============ */
const WATCH = {
 intro:"If he only ever hears you, he'll learn to understand you — one voice, one speed, one accent — and then find he can't follow anyone else. Video is the fix, and it's the only part of this plan that scales without costing you anything.",
 rule:["The 80% rule.","A video he understands most of teaches him far more than one he understands a third of. Most \"English for beginners\" channels are really aimed at A2 and will drown him. Everything below is sorted by when it becomes usable."],
 how:[["same video","Four times across a week, not four different videos. First time he understands nothing, fourth time most of it. That climb is the learning."],
      ["no Russian subtitles","If Russian is on screen he reads Russian and hears nothing. It feels productive, which makes it worse."],
      ["not in the background","Ten focused minutes beat an hour of English playing while he cooks."],
      ["he chooses","Interest is the only thing that produces the hundreds of hours he needs. A boring perfect video loses to a fishing channel he loves."]],
 groups:[[1,"Usable now"],[8,"From about week 8"],[16,"From month four"]],
 hobbies:["Warhammer is bad listening material at this level but excellent conversation material, so use it where it works. Week 4's <em>I have</em> becomes his armies. Week 6's <em>I like / I don't like</em> becomes factions, and he will have opinions. Week 11's past simple becomes what he played last night.",
          "Broken English about something he loves is worth an hour of correct English about a textbook's invented family. LEGO and cars do the watching job; Warhammer does the talking job."]
};

/* ============ guide, teacher-facing ============
   Blocks: p (paragraph), note (aside), ru (the Russian-rule aside), rows (two-column table),
   points (bold lead + text), links (dictionaries). Markup inside x is trusted, authored here. */
const GUIDE = [
 {h:"How this works", b:[
  {t:"p", x:"He is starting from nothing, so almost none of the usual advice about teaching a friend applies. Your ear for what sounds wrong is your best asset and it's mostly idle for the first few months, because he isn't producing sentences yet to be wrong. Right now you are two different things: a source of repetition, and the reason he doesn't quit."},
  {t:"ru", x:"<strong>Use Russian.</strong> \"English only\" is advice for classroom teachers with eight first languages in the room. You have a shared language — use it. Russian for explaining, English for doing. Thirty seconds of Russian beats ten minutes of mime. The ratio should shift on its own. By month three, Russian for grammar and nothing else."},
  {t:"note", x:"<strong>You are his audio.</strong> He can't read English aloud — English spelling doesn't reliably tell you how a word sounds, and the usual beginner workaround is writing Cyrillic transcriptions, which bakes in an accent he'll spend years removing. So record every new phrase in the app, every session, in your voice. That recording is his homework, his textbook audio, and the back of every card he studies. It takes three minutes and it's the single most useful thing you do."}]},
 {h:"Three sessions a week, not one", b:[
  {t:"p", x:"Twenty-five minutes three times a week beats seventy-five minutes once. Beginners forget quickly, and a whole week between sessions throws away most of what was learned. It's also less punishing — twenty-five minutes of being bad at something is survivable in a way that seventy-five isn't."},
  {t:"rows", x:[["A · new","Meet the week's phrases, repeat them, record them."],["B · drill","Same phrases, faster, plus listening and one sound."],["C · use","Real conversation with only what he knows. Update the bank."]]}]},
 {h:"Cards between sessions", b:[
  {t:"p", x:"His phone runs an Anki-style deck built from the phrases you have already taught. Each phrase makes two cards. First he hears it and says what it means; once that is easy, a second card shows the Russian and he says the English aloud. He grades himself, and the app brings each card back just before he would forget it: minutes, then a day, then days, then weeks."},
  {t:"p", x:"Cards never tick the phrase bank. Only you tick, in the room, where a pause is audible. His cards tell you something different: which phrases keep slipping. They arrive in his progress report."}]},
 {h:"Phrases, not rules", b:[
  {t:"p", x:"Teach \"I'd like a coffee, please\" as one unbreakable block. Don't explain <em>would</em>. Don't explain the article. He learns the sentence the way he learned sentences as a child, and the grammar gets attached to it later, once he has something to attach it to. Analysis before fluency is what makes adult beginners give up."},
  {t:"p", x:"This matters even more given his background. If nobody ever taught him what a verb or a noun is — in Russian either — then no grammar explanation in any language will land. Check that early, in Russian, and if the answer is no, teach entirely in phrases for the first six months. It works fine. It just needs to be a decision rather than an accident."}]},
 {h:"The three rules for the room", b:[
  {t:"points", x:[["Wait.","When he's stuck, count to ten in your head before helping. The silence feels unbearable to you and it's where the learning happens. Filling it is the commonest mistake fluent friends make."],
                  ["Normal speed.","Don't slow down — repeat instead. Slow English is a dialect nobody speaks, and learning it means learning to understand nothing in the real world."],
                  ["Make it safe to sound stupid.","He said nothing in that first conversation, and some of that was embarrassment, not inability. Adults quit beginner language learning because of humiliation far more often than difficulty. A friend can fix that better than any paid tutor — that's your real advantage here."]]}]},
 {h:"What to expect", b:[
  {t:"p", x:"Basic conversation takes six to twelve months at this level, not three. But the first eight weeks feel fast, because going from nothing to something is the most visible progress he will ever make. The dangerous stretch is months four to seven, when he can say a lot but still can't follow a real conversation. Warn him it's coming, so that when it arrives it feels expected rather than like failure."}]},
 {h:"Dictionaries, for you", b:[
  {t:"p", x:"Keep one open during every session. Looking a word up in front of him costs ten seconds, corrects you on the spot, and teaches him the most useful habit a learner has. An open dictionary is a feature of a good session, not an admission of anything."},
  {t:"links", x:[
   {n:"Cambridge Dictionary", u:"https://dictionary.cambridge.org/", d:"The default. Recorded UK and US audio on one click, definitions written in deliberately simple English. Switch it to English–Russian and it becomes the better one for him: 20,000 words with Russian translations, and a list of the 50 commonest errors Russian speakers make, explained in Russian."},
   {n:"Forvo", u:"https://forvo.com/languages/en/", d:"Crowdsourced recordings by native speakers, several per word, male and female, tagged by country so you can compare accents. Over 7 million pronunciations, free. The best thing there is for names, proper nouns and odd one-off words."},
   {n:"YouGlish", u:"https://youglish.com/", d:"Real people saying the word inside real YouTube clips, over 100 million of them, filterable by US, UK or Australian accent. Use it when you need to hear a word in a sentence, which is what you actually need for stress and rhythm and what a dictionary can't give you."},
   {n:"Oxford Learner's Dictionaries", u:"https://www.oxfordlearnersdictionaries.com/", d:"An equally good alternative to Cambridge, with the phonetic transcription shown more prominently. Free."}]},
  {t:"note", x:"<strong>Synthesised voices.</strong> Google's inline pronunciation widget and most apps use text-to-speech, which is usually right and occasionally confidently wrong — especially on names and loanwords. His app has a robot voice too, because it is the only one that works offline, and it stays labelled as a robot. Your voice is the one he copies."},
  {t:"note", x:"<strong>One rule worth knowing:</strong> in words borrowed from Greek, <em>ch</em> is a hard /k/. Chaos (KAY-oss), character, chemistry, architect, scheme, echo, chorus, anchor, mechanic, monarch, technology, orchestra, stomach, ache, Christmas. It'll come up constantly with his Warhammer vocabulary, which is drenched in pseudo-Greek."}]},
 {h:"Reading, from about week 8", b:[
  {t:"p", x:"Not a real book — a graded reader. These are short books written with a capped vocabulary: Oxford Bookworms Starter (about 250 words) or Penguin Easystarts (about 200). Twenty-four pages, heavily illustrated, present simple throughout. A whole book is one evening, and finishing one is worth more to him than any exercise."},
  {t:"p", x:"<strong>Always with the audio, listening and reading at the same time.</strong> That combination welds sound to spelling without teaching a single phonics rule, and it means every sentence reaches him in a native voice rather than yours. Five books at Starter, then five at Level 1, then up. Never skip a level — slightly-too-easy builds fluency, slightly-too-hard builds a dictionary habit."},
  {t:"p", x:"Steer him away from children's books, which are much harder than they look, and from anything he loves in Russian read in English. That's how beginners end up convinced they're stupid."}]}
];

/* ============ his side, in Russian. He reads it alone, with nobody to explain it. ============ */
const SOLO = {
 /* shown to the teacher above the solo page, in English */
 forTeacher:"For him, not for you. In Russian on purpose: he reads it alone, in a waiting room or on a train, with nobody there to explain it. His own link is this page with #him on the end: same file, his tabs only, no English and none of your notes about him.",
 intro:["Это для времени, которое всё равно пропадает: дорога, очередь, палата, ожидание. Пять минут три раза в день дают больше, чем час один раз в неделю, потому что забывается всё быстрее, чем кажется.",
        "Ничего нового здесь не учат, только то, что уже было на занятии. Новое без учителя брать нельзя: прочитаешь не так, как оно звучит, и переучиваться будет дольше, чем выучить."],
 groups:["С записью в телефоне","Ничего не нужно","В телефоне"],
 voiceHim:"Учитель записывает фразы своим голосом, и они приходят к тебе сами, когда есть интернет. Один раз пришли, и дальше голос работает без него, в дороге и в больнице.",
 voiceRobot:"Кнопка «робот» работает всегда, но это робот. Главный голос, за которым надо повторять, это голос учителя.",
 voiceTeacher:"Every phrase has a record button. Record it once and it reaches his phone by itself the next time he has internet, then it plays with no signal. His cards play your voice on the back.",
 weekLink:"Если учитель ушёл вперёд, попроси у него новую ссылку, она сама переставит неделю.",
 rules:[["Говорить вслух важнее, чем понимать.","Понимание придёт само от слушания. Речь сама не приходит, её нужно наговорить ртом, и чем раньше, тем лучше."],
        ["Русскими буквами английские слова не записывай.","Ни разу, ни одно слово. Такое произношение потом снимается годами."],
        ["Застрял, пропусти.","Непонятное копи и приноси на занятие, а не разбирай сам в переводчике."],
        ["Пять минут это уже занятие.","Не получилось десять, сделай две. Каждый день по чуть-чуть работает, раз в неделю помногу нет."]],
 cards:["Каждая карточка возвращается как раз тогда, когда начинаешь её забывать. Сначала через минуту, потом через день, потом через неделю.",
        "Сначала ты слышишь фразу и вспоминаешь, что она значит. Когда это легко, появляется вторая карточка: по-русски, а сказать надо по-английски, вслух.",
        "Честно оценивай себя. «Забыл» не ошибка: карточка просто придёт снова и быстрее."],
 bank:"Галочки ставит учитель на занятии, когда фраза выходит без паузы. Было ноль."
};
