/**
 * Plan4U - Cycle Tracker Module (Математика и логика женского календаря)
 * 
 * Специально спроектирован для поддержки нерегулярного цикла:
 * 1. Расчет медианы вместо среднего арифметического.
 * 2. Окно вероятности (диапазон [min, max]) вместо ложной одной даты.
 * 3. Отсечение аномалий (флаг isOutlier для циклов при болезни/стрессе).
 * 4. Биологический пересчет по фазе овуляции (+14 дней лютеиновой фазы).
 * 5. Связка с продуктивностью и циклическим планированием дел.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.Plan4UCycleTracker = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'plan4u_cycle_data';

  // Вспомогательные функции дат
  function parseDate(str) {
    if (!str || typeof str !== 'string') return null;
    const [y, m, d] = str.split('-').map(Number);
    return (y && m && d) ? new Date(y, m - 1, d) : null;
  }

  function formatDate(d) {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  function addDays(dateStr, n) {
    const d = parseDate(dateStr);
    if (!d) return '';
    d.setDate(d.getDate() + n);
    return formatDate(d);
  }

  function diffInDays(startStr, endStr) {
    const d1 = parseDate(startStr), d2 = parseDate(endStr);
    return (d1 && d2) ? Math.round((d2 - d1) / 86400000) : 0;
  }

  const getTodayString = () => formatDate(new Date());

  function calculateMedian(numbers) {
    if (!numbers || !numbers.length) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  const DEFAULT_SETTINGS = {
    enabled: false,
    isIrregular: true,       // По умолчанию включен умный режим для нерегулярного цикла
    periodLength: 5,         // Средняя длительность месячных (дней)
    defaultCycleLength: 28,  // Базовый ориентир, если пока мало записей
    lutealLength: 14,        // Лютеиновая фаза (биологическая константа 12-14 дней)
    showInTopBar: true,      // Показывать круглый значок в шапке блокнота
    lutealNutritionSync: false, // Связка с питанием: адаптация КБЖУ в лютеиновую фазу
    lutealBoostPercent: 10      // Процент повышения нормы калорий и углеводов (10% по умолчанию)
  };

  const phase = (title, badge, energies, taskTips) => ({ title, badge, energies, taskTips });
  const pick = (arr, fallback = '') => (Array.isArray(arr) && arr.length) ? arr[Math.floor(Math.random() * arr.length)] : fallback;

  const ADVICE_DATA = {
    ru: {
    menstrual_early: phase(
      "Менструальная фаза (Забота о себе)", "🩸 Дни отдыха",
      ["Уютное замедление 🪫","Режим тепла и заботы 🍵","Бережный покой 🕯️","Время для себя 🪫","Мягкий плед и тишина 🤍"],
      [
      "Сегодня можно официально зарыться в одеяло, взять большую кружку горячего чая и никуда не спешить. Твоё тело сейчас делает колоссальную внутреннюю работу — относись к нему с нежностью.",
      "Слушай, сегодня точно не день для подвигов и спасения мира. Если хочется просто лежать и смотреть любимый сериал — позволь себе это без малейшего чувства вины. Ты заслужила эту паузу.",
      "Первые дни самые хрупкие. Вычеркни из ежедневника всё, что не горит, включи мягкий свет и позволь близким позаботиться о тебе. Дела подождут.",
      "Организм сейчас обновляется и сбрасывает всё лишнее. Лучший подарок себе — сбавить обороты до минимума, выпить что-то согревающее и вкусно поесть.",
      "Тело просит тишины и горизонтального положения. Никаких тяжёлых тренировок и споров — только мягкие носочки, покой и бережное отношение к себе.",
      "Если силы на нуле — это не лень, это биология. Сделай глубокий вдох, выдохни накопившееся напряжение и подари себе день абсолютной заботы."
      ]
    ),
    menstrual_late: phase(
      "Менструальная фаза (Мягкий выход)", "🩸 Завершение отдыха",
      ["Силы возвращаются 🌿","Мягкое пробуждение 🌤️","Лёгкое дыхание 🌸","Спокойная волна ☕","Тихий подъём 🍃"],
      [
      "Туман потихоньку рассеивается, и внутри просыпается лёгкое приятное тепло. Не бросайся сразу во все тяжкие — двигайся в спокойном, естественном ритме.",
      "Тело отпускает напряжение первых дней. Самое время полить цветы, навести порядок на рабочем месте и не спеша набросать планы на неделю.",
      "Чувствуется, как батарейка начинает потихоньку заряжаться. Отличный день для неспешной прогулки на свежем воздухе, тёплого душа и душевной книги.",
      "Приятное ощущение чистоты и обновления. В голову начинают приходить свежие мысли — запиши их в блокнот, пока они мягкие и вдохновляющие.",
      "Острые ощущения позади, наступает пора мягкого возвращения к активности. Сделай лёгкую растяжку, вдохни полной грудью и улыбнись новому дню.",
      "Твой темп сейчас — размеренный и грациозный. Всё успеется, главное — беречь это вновь зарождающееся тепло и энергию."
      ]
    ),
    follicular_early: phase(
      "Фолликулярная фаза (Подъём сил)", "🌱 Новые старты",
      ["Энергия растёт ⚡","Ясность и лёгкость 🍃","Свежий взгляд 💡","Прилив вдохновения 🔋","Весенний подъём 🌸"],
      [
      "Будто открыли окно в душной комнате — в голове свежо, мысли ясные, а настроение на подъёме! Идеальный день, чтобы взяться за то, что давно откладывала.",
      "Эстроген пошёл в уверенный рост, и мир снова полон ярких красок. Сегодня всё схватывается на лету, а дела спорятся легко и весело.",
      "Вдохновение бьёт ключом! Набросай план новых проектов или список приятных покупок — интуиция и чувство вкуса сегодня работают на все 100%.",
      "Потрясающее чувство лёгкости в теле. Самое время вернуться к любимому фитнесу, встретиться на кофе или запланировать спонтанную поездку.",
      "Задачи решаются с удовольствием, словно играючи. Поймай этот поток уверенности и насладись ощущением свежих сил!",
      "Ты сияешь изнутри, и это замечают все вокруг. Заряжайся этим весенним настроением и смело делай первый шаг к своим мечтам."
      ]
    ),
    follicular_late: phase(
      "Фолликулярная фаза (Высокий драйв)", "✨ Время смелых идей",
      ["Высокий драйв 🚀","Уверенность и кураж 🔥","На волне успеха 💎","Пик продуктивности ⚡","Огонь и решимость 🌟"],
      [
      "Уверенность в себе зашкаливает! Если назрел важный разговор, сложный проект или смелый шаг — вперёд, сегодня тебя ничто не остановит.",
      "Ты сейчас на пике скорости реакции и ясности ума. Берись за самые масштабные задачи — концентрация будет феноменальной.",
      "Столько живой энергии, что можно свернуть горы! Направь эту искру в карьеру, творчество или мощную тренировку — результат восхитит.",
      "Харизма на максимуме, улыбка заразительна. Люди сегодня слушают тебя с неподдельным восторгом — используй это для важных договорённостей.",
      "Кажется, что нет преград, которые нельзя легко обойти. Доверяй своей смелости — сегодня тот самый день, когда всё получается.",
      "Шикарный день для ярких презентаций, мозговых штурмов и выхода из зоны комфорта. Ты великолепна и готова покорять вершины!"
      ]
    ),
    ovulation: phase(
      "Овуляция (Пик продуктивности)", "✨ Пик энергии",
      ["Сияние и шарм 👑","Пик обаяния 💖","Максимум сил 🌟","Магнитная энергия ✨","Цветущая красота 🌺"],
      [
      "Ты сегодня просто сияешь! Идеальный день для свиданий, встреч с близкими подругами, красивых фотосессий или праздничного ужина.",
      "Твоё природное очарование сейчас на абсолютном максимуме. Доверяй интуиции и чувствам — они подсказывают самые верные решения.",
      "Море нежности, открытости и общительности. Запланируй на вечер что-то особенное — впечатления останутся в сердце надолго.",
      "Ощущение полёта и женской силы. Не прячь своё сияние — сегодня мир с удовольствием любуется тобой и отвечает взаимностью.",
      "Глаза горят, осанка королевская! Отличное время для душевных разговоров по душам, романтики и комплиментов, которые ты заслужила.",
      "Лови этот пик красоты и энергии. Надень любимое платье, подари себе маленькую радость и почувствуй себя королевой своего дня."
      ]
    ),
    luteal_early: phase(
      "Лютеиновая фаза (Завершение дел)", "📋 Порядок и структура",
      ["Глубокий фокус 🎯","Спокойная сила 🌾","Вдумчивый порядок ☕","Концентрация 📑","Уютное заземление 🏡"],
      [
      "Энергия становится глубже, спокойнее и основательнее. Отличное время для методичной работы, проверки деталей и наведения идеального порядка.",
      "Внешняя суета спала, пришло время доводить начатое до совершенства. Никакой спешки — только уютная сосредоточенность и вкусный кофе.",
      "Прекрасный день для дома: приготовить что-то ароматное, перебрать вещи, разобрать вкладки в браузере и закрыть старые висящие задачи.",
      "Интуиция подсказывает, что пора заземлиться. Включи мягкую фоновую музыку и методично вычеркни все мелкие рутинные пункты из списка.",
      "Твой критический ум сейчас особенно остёр и точен. Ты легко заметишь любую мелочь и наведёшь кристальную ясность в любых делах.",
      "Преврати рутину в удовольствие: уютный свитер, порядок на столе и спокойный шаг за шагом. Ты держишь всё под полным контролем."
      ]
    ),
    luteal_late: phase(
      "Лютеиновая фаза (Бережный режим)", "🧸 Забота и тепло",
      ["Чувствительность к себе 🕊️","Режим бережности ☁️","Уязвимость и глубина 🕯️","Мягкий кокон 🧸","Тихий чай и плед 🍵"],
      [
      "Эмоции могут быть ярче и острее обычного — и это совершенно нормально! Если хочется поплакать или покапризничать — разреши себе. Ты живой человек, а не робот.",
      "Время выстроить мягкие, но прочные границы. Никаких токсичных споров, переработок и самокритики. Только горячий чай, вкусный шоколад и покой.",
      "Организм готовится к глубокой перезагрузке. Не требуй от себя подвигов и идеальности — сейчас самое главное сберечь свой внутренний душевный свет.",
      "Если кажется, что весь мир вокруг раздражает — просто выдохни, отойди в сторонку и побалуй себя чем-то тёплым. Мир подождёт, пока ты бережёшь себя.",
      "Чувствительность на пределе? Завернись в мягкий плед, зажги свечу и включи добрый фильм. Ты со всем справляешься, просто сейчас время нежности.",
      "Пожалуйста, будь к себе снисходительна сегодня. Никаких укоров за несделанное. Твоё спокойствие и комфорт дороже любых списков дел."
      ]
    ),
    overdue_window: phase(
      "Окно ожидания (Перезагрузка)", "⏳ Скоро перезагрузка",
      ["Прислушайся к телу 🕊️","Спокойное ожидание 🌿","Мягкая пауза 🍵","Доверие природе 🌸"],
      [
      "Женский организм — не бездушный швейцарский будильник. Сдвиг на пару дней из-за погоды, эмоций или перемены климата — норма. Не накручивай себя, держи всё под рукой и дыши спокойно.",
      "Тело неторопливо готовится к новому кругу. Не подгоняй его и не тревожься: пей тёплую воду, одевайся уютно и позволь природе сделать своё дело.",
      "Слушай внутренние сигналы, береги поясницу и держи любимые средства гигиены наготове. Всё идёт естественным чередом в своём ритме.",
      "Побудь в режиме мягкого ожидания. Никакой паники: организм сам знает идеальный момент для перезагрузки."
      ]
    ),
    luteal_nutrition: [
      "Лютеиновая фаза: сегодня лёгкая тяга к сладкому — это абсолютно нормально, норма калорий бережно повышена 🌸",
      "Организм сейчас тратит больше энергии на внутренние процессы. Побалуй себя сложными углеводами или десертом без чувства вины 🍫✨",
      "Фаза уюта и тепла: телу нужно чуть больше сил. Норма КБЖУ адаптирована, чтобы ты чувствовала себя сытой и спокойной 🍵🥑",
      "Гормональный фон сейчас требует поддержки — добавь ягод, орешков или тёплого какао. Мы прибавили калорий для твоего комфорта 🍓✨",
      "Не кори себя за хороший аппетит: в лютеиновую фазу обмен веществ ускоряется на 5–10%. Мы мягко скорректировали норму дня 🧸💖",
      "Слушай своё тело: сегодня ему требуется чуть больше энергии и бережности. Кушай вкусно и с любовью к себе 🥑✨"
    ]
    },
    uk: {
    menstrual_early: phase(
      "Менструальна фаза (Турбота про себе)", "🩸 Дні відпочинку",
      ["Затишне уповільнення 🪫","Режим тепла та турботи 🍵","Дбайливий спокій 🕯️","Час для себе 🪫","М'який плед і тиша 🤍"],
      [
      "Сьогодні можна офіційно загорнутися в теплий плед, заварити велику чашку чаю і нікуди не поспішати. Твоє тіло зараз робить колосальну внутрішню роботу — постався до себе з ніжністю.",
      "Слухай, сьогодні точно не день для подвигів і порятунку світу. Якщо хочеться просто лежати й дивитися улюблений серіал — дозволь собі це без жодного докору сумління.",
      "Перші дні найбільш тендітні. Викресли з планів усе, що не горить, увімкни м'яке світло і дозволь собі просто побути в спокої. Справи зачекають.",
      "Організм зараз оновлюється і відпускає все зайве. Найкращий подарунок собі — зменшити оберти до мінімуму, зігрітися і потішити себе смачненьким.",
      "Тіло просить тиші та відпочинку. Жодних важких тренувань чи суперечок — тільки м'які шкарпетки, затишок і дбайливе ставлення до себе.",
      "Якщо сил обмаль — це не лінощі, це чиста біологія. Зроби глибокий вдих, відпусти напругу і подаруй собі день абсолютної турботи."
      ]
    ),
    menstrual_late: phase(
      "Менструальна фаза (М'який вихід)", "🩸 Завершення відпочинку",
      ["Сили повертаються 🌿","М'яке пробудження 🌤️","Легкий подих 🌸","Спокійна хвиля ☕","Тихий підйом 🍃"],
      [
      "Туман потихеньку розсіюється, і всередині прокидається приємне тепло. Не кидайся одразу в усі справи — рухайся у своєму спокійному, природному темпі.",
      "Тіло відпускає напругу перших днів. Чудовий час полити квіти, навести лад на столі та неспішно намітити плани на найближчі дні.",
      "Відчувається, як батарейка починає поступово заряджатися. Прекрасний день для прогулянки на свіжому повітрі, теплого душу та затишної книги.",
      "Приємне відчуття чистоти й оновлення. У голову починають приходити свіжі думки — занотуй їх у блокнот, поки вони легкі та надихаючі.",
      "Гострі відчуття позаду, настає час м'якого повернення до справ. Зроби легку розтяжку, вдихни на повні груди та посміхнися новому дню.",
      "Твій темп зараз — спокійний і граційний. Усе встигнеться, головне — берегти це тепло і силу, що повертаються."
      ]
    ),
    follicular_early: phase(
      "Фолікулярна фаза (Підйом сил)", "🌱 Нові старти",
      ["Енергія зростає ⚡","Ясність та легкість 🍃","Свіжий погляд 💡","Прилив натхнення 🔋","Весняний підйом 🌸"],
      [
      "Немов відкрили вікно у кімнаті після дощу — в голові свіжо, думки чіткі, а настрій сонячний! Ідеальний день, щоб розпочати те, що давно відкладала.",
      "Естроген упевнено пішов у ріст, і світ знову сповнений яскравих барв. Сьогодні все схоплюється на льоту, а справи робляться легко й невимушено.",
      "Натхнення вирує! Накидай план нових проєктів чи список приємних покупок — інтуїція та відчуття смаку сьогодні на висоті.",
      "Дивовижне відчуття легкості в тілі. Саме час повернутися до улюбленої активності, зустрітися на каву чи спланувати спонтанну подорож.",
      "Завдання вирішуються із задоволенням, наче гра. Спіймай цей потік упевненості й насолодися відчуттям свіжих сил!",
      "Ти сяєш зсередини, і це помітно всім навколо. Заряджайся цим сонячним настроєм і сміливо роби перший крок до своїх бажань."
      ]
    ),
    follicular_late: phase(
      "Фолікулярна фаза (Високий драйв)", "✨ Час сміливих ідей",
      ["Високий драйв 🚀","Впевненість та кураж 🔥","На хвилі успіху 💎","Пік продуктивності ⚡","Вогонь та рішучість 🌟"],
      [
      "Упевненість у собі зашкалює! Якщо назріла важлива розмова, складний проєкт або сміливий крок — уперед, сьогодні тебе ніщо не спинить.",
      "Ти зараз на піку швидкості реакції та гостроти розуму. Берися за наймасштабніші завдання — концентрація буде бездоганною.",
      "Стільки живої енергії, що можна звернути гори! Спрямуй цю іскру в кар'єру, творчість чи тренування — результат вразить.",
      "Харизма на максимумі, усмішка чарівна. Люди сьогодні слухають тебе із щирим захопленням — чудовий час для важливих домовленостей.",
      "Здається, немає перешкод, які не можна легко здолати. Довіряй своїй сміливості — сьогодні саме той день, коли все вдається.",
      "Розкішний день для яскравих виступів, нових викликів та сміливих рішень. Ти неперевершена і готова сяяти!"
      ]
    ),
    ovulation: phase(
      "Овуляція (Пік продуктивності)", "✨ Пік енергії",
      ["Сяйво та шарм 👑","Пік чарівності 💖","Максимум сил 🌟","Магнітна енергія ✨","Квітуча краса 🌺"],
      [
      "Ти сьогодні просто сяєш! Ідеальний день для романтичного побачення, зустрічі з подругами, гарних фото чи святкової вечері.",
      "Твоя природна чарівність зараз на абсолютному піку. Довіряй інтуїції та відчуттям — вони підказують найвірніші стежки.",
      "Море ніжності, відкритості та тепла. Заплануй на вечір щось особливе — приємні враження залишаться в серці надовго.",
      "Відчуття польоту і жіночої сили. Не ховай свого сяйва — сьогодні світ із радістю милується тобою і відповідає взаємністю.",
      "Очі сяють, постава королівська! Чудовий час для щирих душевних розмов, романтики та компліментів, на які ти заслуговуєш.",
      "Лови цей пік краси та життєвої сили. Одягни улюблену сукню, подаруй собі маленьку радість і відчуй себе королевою свого дня."
      ]
    ),
    luteal_early: phase(
      "Лютеїнова фаза (Завершення справ)", "📋 Лад і структура",
      ["Глибокий фокус 🎯","Спокійна сила 🌾","Вдумливий лад ☕","Концентрація 📑","Затишне заземлення 🏡"],
      [
      "Енергія стає глибшою, спокійнішою та ґрунтовнішою. Чудовий час для методичної роботи, уваги до деталей та наведення ідеального порядку.",
      "Зовнішня метушня спала, настав час доводити розпочате до досконалості. Жодного поспіху — лише затишна зосередженість і смачна кава.",
      "Прекрасний день для дому: приготувати щось духмяне, перебрати речі, закрити старі незавершені завдання та впорядкувати нотатки.",
      "Інтуїція підказує, що час заземлитися. Увімкни спокійну музику і методично викресли всі рутинні пункти зі свого блокнота.",
      "Твій розум зараз надзвичайно спостережливий і точний. Ти легко помітиш найдрібніші деталі й наведеш кришталеву ясність у справах.",
      "Перетвори буденні справи на насолоду: теплий светр, порядок на столі та плавний рух уперед. Ти все тримаєш під чуйним контролем."
      ]
    ),
    luteal_late: phase(
      "Лютеїнова фаза (Бережний режим)", "🧸 Турбота і тепло",
      ["Чутливість до себе 🕊️","Режим турботи ☁️","Глибина та вразливість 🕯️","М'який кокон 🧸","Теплий чай і плед 🍵"],
      [
      "Емоції можуть бути гострішими й яскравішими ніж зазвичай — і це абсолютно природно! Якщо хочеться посумувати чи покапризувати — дозволь собі. Ти жива людина, а не робот.",
      "Час збудувати м'які, але міцні особисті кордони. Жодних токсичних суперечок, перевтоми та самокритики. Тільки теплий чай, шоколад і спокій.",
      "Організм готується до глибокого перезавантаження. Не вимагай від себе надпродуктивності — найцінніше зараз зберегти свій внутрішній душевний спокій.",
      "Якщо здається, що все навколо дратує — просто видихни, зроби крок назад і потіш себе чимось приємним. Світ зачекає, поки ти піклуєшся про себе.",
      "Чутливість на межі? Загорнися в м'яку ковдру, запали свічку й увімкни добре кіно. Ти з усім чудово справляєшся, просто зараз час ніжності.",
      "Будь ласка, будь поблажливою до себе сьогодні. Жодних докорів за невиконане. Твій внутрішній комфорт дорожчий за будь-які списки справ."
      ]
    ),
    overdue_window: phase(
      "Вікно очікування (Перезавантаження)", "⏳ Скоро перезавантаження",
      ["Прислухайся до тіла 🕊️","Спокійне очікування 🌿","М'яка пауза 🍵","Довіра природі 🌸"],
      [
      "Жіночий організм — не механічний швейцарський годинник. Зсув на кілька днів через погоду, емоції чи стрес — норма. Не хвилюйся, тримай усе під рукою і дихай вільно.",
      "Тіло неспішно готується до нового кола. Не підганяй його: пий теплу воду, вдягайся затишно і дозволь природі зробити свою справу.",
      "Слухай внутрішні підказки тіла, бережи себе і тримай засоби гігієни напоготові. Усе відбувається у своєму гармонійному темпі.",
      "Побудь у стані спокійного очікування. Жодної тривоги: організм сам чудово знає ідеальний момент для перезавантаження."
      ]
    ),
    luteal_nutrition: [
      "Лютеїнова фаза: сьогодні легка тяга до солодкого — це абсолютно нормально, норму калорій дбайливо підвищено 🌸",
      "Організм зараз витрачає більше енергії на внутрішні процеси. Потіш себе складними вуглеводами чи улюбленим десертом без почуття провини 🍫✨",
      "Фаза затишку й тепла: тілу потрібно трохи більше сил. Норму КБЖВ адаптовано, щоб ти почувалася ситою і спокійною 🍵🥑",
      "Гормональний фон потребує підтримки — додай ягід, горішків або теплого какао. Ми додали калорій для твого комфорту 🍓✨",
      "Не картай себе за апетит: у лютеїнову фазу метаболізм прискорюється на 5–10%. Ми м'яко скоригували денну норму 🧸💖",
      "Слухай своє тіло: сьогодні йому потрібно більше турботи й енергії. Їж смачно і з любов'ю до себе 🥑✨"
    ]
    },
    en: {
    menstrual_early: phase(
      "Menstrual Phase (Self-Care)", "🩸 Rest Days",
      ["Cozy Slowdown 🪫","Warmth & Care 🍵","Gentle Peace 🕯️","Time for Yourself 🪫","Soft Blanket & Quiet 🤍"],
      [
      "Today you have full permission to cocoon in your softest blanket, brew a warm cup of tea, and take it easy. Your body is doing immense internal work right now.",
      "Today is definitely not a day for heroic feats. If all you want to do is curl up and binge your favorite comfort show, let yourself do it without an ounce of guilt.",
      "The first couple of days are the most delicate. Cross off anything non-urgent, dim the lights, and let the world wait. You deserve this restful pause.",
      "Your body is clearing the slate and renewing itself. The kindest choice today is dropping your speed to a gentle stroll, staying warm, and having a nourishing bite.",
      "Your system is craving horizontal rest and quiet comfort. Skip heavy workouts and tough talks — wrap up in warm socks and be sweet to yourself.",
      "Low energy right now isn't laziness; it's pure biology. Take a deep, restorative breath, release that unspoken pressure, and treat yourself with tenderness."
      ]
    ),
    menstrual_late: phase(
      "Menstrual Phase (Gentle Return)", "🩸 Winding Down Rest",
      ["Energy Returning 🌿","Gentle Awakening 🌤️","Easy Breathing 🌸","Calm Flow ☕","Quiet Renewal 🍃"],
      [
      "The mental fog is gently lifting, and a subtle warmth is returning inside. No need to rush into overdrive — move at your own sweet, unrushed pace.",
      "Your body is letting go of the heavy tension. It's a wonderful day for quiet tidying, watering plants, and casually penciling in ideas for the week.",
      "You can feel the battery starting to recharge. Perfect time for a leisurely stroll in the fresh air, a warm shower, and a comforting book.",
      "A sweet sense of clarity and renewal. Creative thoughts are starting to bubble up — jot them down in your notes while they're fresh.",
      "The most intense days are behind you. Ease back in with gentle stretching, deep breaths, and a relaxed, optimistic mindset.",
      "Your rhythm right now is smooth and graceful. Everything will get done in time; preserve this gentle spark of rising vitality."
      ]
    ),
    follicular_early: phase(
      "Follicular Phase (Rising Energy)", "🌱 Fresh Starts",
      ["Energy Rising ⚡","Clarity & Lightness 🍃","Fresh Outlook 💡","Creative Spark 🔋","Springtime Bloom 🌸"],
      [
      "Like cracking open a window to crisp morning air — your mind is sharp, thoughts are crystal clear, and motivation is naturally kicking in!",
      "Estrogen is on the rise and the world feels vivid again. You're absorbing ideas effortlessly today; tasks feel playful rather than daunting.",
      "Inspiration is flowing! Draft that new project, sketch out ambitious plans, or treat yourself to something that makes your eyes light up.",
      "A wonderful lightness in your body. Perfect timing for a great workout, an impromptu coffee date, or plotting your next adventure.",
      "Things are clicking into place with effortless ease. Ride this wave of optimism and enjoy the sensation of fresh vitality.",
      "You have that natural inner glow today. Soak in this upbeat mood and take that confident first step toward what you've been dreaming of."
      ]
    ),
    follicular_late: phase(
      "Follicular Phase (High Drive)", "✨ Bold Ideas",
      ["High Drive 🚀","Confidence & Fire 🔥","In Full Stride 💎","Peak Productivity ⚡","Unstoppable Spark 🌟"],
      [
      "Your confidence is through the roof! If an important conversation or a daring goal has been on your mind — step forward, nothing can stop you today.",
      "Your quick wit, focus, and verbal agility are at their absolute peak. Tackle the most demanding challenges; your mind won't miss a beat.",
      "So much radiant drive! Channel this momentum into a creative project, career milestone, or a high-energy workout — you'll crush it.",
      "Your natural magnetism is electric. People are tuned in to your ideas and warmth; it's a prime day to pitch, negotiate, or collaborate.",
      "Obstacles feel small and easily solved. Trust your instinct and boldness — today is one of those days where everything just aligns.",
      "An incredible day for bold launches, brainstorming, and owning the spotlight. You are completely in your element!"
      ]
    ),
    ovulation: phase(
      "Ovulation (Peak Performance)", "✨ Peak Energy",
      ["Radiance & Charm 👑","Peak Magnetism 💖","Full Glow 🌟","Magnetic Aura ✨","Blooming Beauty 🌺"],
      [
      "You are absolutely glowing today! An ideal moment for a romantic date, a girls' night out, a photoshoot, or an enchanting dinner.",
      "Your natural magnetism and charm are at an all-time high. Trust your heart and intuition — they are leading you in the best direction.",
      "A tidal wave of warmth, empathy, and social grace. Plan something delightful for the evening — you'll cherish the memories.",
      "A magical feeling of poise and feminine radiance. Don't hide your light; the world is delighted to reflect your joy back to you.",
      "Eyes sparkling, effortless poise. A fabulous day for deep, meaningful conversations, romance, and well-earned compliments.",
      "Bask in this peak of vitality and beauty. Put on your favorite outfit, treat yourself, and embrace feeling like the queen of your day."
      ]
    ),
    luteal_early: phase(
      "Luteal Phase (Wrapping Up)", "📋 Order & Structure",
      ["Deep Focus 🎯","Grounded Calm 🌾","Thoughtful Order ☕","Concentration 📑","Cozy Nesting 🏡"],
      [
      "Your energy is turning inward, grounded and wonderfully steady. A prime time for methodical work, editing details, and organizing your space.",
      "The outer buzz has settled, making room for thoughtful craft. No rushing — just quiet concentration, a warm mug, and satisfying progress.",
      "A lovely day for home comfort: cooking something nourishing, clearing clutter, and tying up those persistent loose ends on your to-do list.",
      "Intuition says it's time to ground yourself. Put on calming background tunes and steadily check off tasks one satisfying tick at a time.",
      "Your analytical eye is sharp and perceptive. You'll catch subtle details easily and bring calm structure to anything disorganized.",
      "Turn routine into ritual: slip into a cozy knit, clear your desk, and work at a comfortable, rhythmic pace. You've got this handled."
      ]
    ),
    luteal_late: phase(
      "Luteal Phase (Gentle Care)", "🧸 Comfort & Warmth",
      ["Gentle Compassion 🕊️","Self-Care Sanctuary ☁️","Vulnerability & Depth 🕯️","Cozy Cocoon 🧸","Warm Tea & Blanket 🍵"],
      [
      "Emotions might be sitting right on the surface, and that is 100% valid. If you feel like having a cry or nesting away, allow yourself that grace. You're human, not a machine.",
      "Time to put up gentle but firm boundaries. Say a firm ‘no’ to toxic drama, overtime, and self-criticism. Stick to hot tea, comfort treats, and serenity.",
      "Your body is prepping for a full reset. Don't demand perfection or hustle from yourself right now — your inner peace is your only real duty.",
      "If everything feels slightly annoying today — pause, exhale deeply, and step away into a calm corner. The world can wait while you look after yourself.",
      "Feeling tender or exposed? Wrap up in your favorite cozy oversized hoodie or blanket. You're handling everything beautifully; just give yourself softness.",
      "Please treat yourself like your own dearest friend today. Forgive any undone items on your list. Your comfort and gentleness come first."
      ]
    ),
    overdue_window: phase(
      "Waiting Window (Reset Soon)", "⏳ Reset Coming Soon",
      ["Listen to Your Body 🕊️","Patient Trust 🌿","Gentle Pause 🍵","Natural Harmony 🌸"],
      [
      "Your body is a living ecosystem, not a mechanical alarm clock. Shifting a few days due to weather, travel, or feelings is normal. Stay calm, keep essentials handy, and take easy breaths.",
      "Your system is gently gearing up for a fresh reset. Don't rush it or fret: drink plenty of warm fluids, dress comfortably, and trust nature’s timing.",
      "Tune in to subtle cues, stay warm, and keep your care items tucked in your bag. Everything is proceeding naturally in its own time.",
      "Embrace this gentle waiting period. No panic or overthinking: your body knows the perfect moment to press reset."
      ]
    ),
    luteal_nutrition: [
      "Luteal phase: a gentle craving for sweets is completely natural today — your daily calories have been thoughtfully increased 🌸",
      "Your body burns more energy during this phase. Enjoy complex carbs or a favorite treat with zero guilt 🍫✨",
      "A season of comfort and warmth: your body needs a bit more fuel. Targets are adapted so you feel nourished and peaceful 🍵🥑",
      "Hormones need gentle support right now — enjoy berries, nuts, or a warm cup of cocoa. We've added calories for your ease 🍓✨",
      "Don't judge yourself for a healthy appetite: metabolism naturally rises by 5–10% in the luteal phase. We adjusted today's target 🧸💖",
      "Listen to your body: it asks for gentleness and energy today. Eat nourishing, delicious food with self-love 🥑✨"
    ]
    }
  };

  class CycleTracker {
    constructor(storage) {
      this.storage = storage || (typeof localStorage !== 'undefined' ? localStorage : null);
      this.data = this.loadData();
    }

    loadData() {
      const defaultData = {
        settings: { ...DEFAULT_SETTINGS },
        history: [],
        symptoms: {}
      };
      if (!this.storage) return defaultData;
      try {
        const raw = this.storage.getItem(STORAGE_KEY);
        if (!raw) return defaultData;
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          history: Array.isArray(parsed.history) ? parsed.history : [],
          symptoms: (parsed.symptoms && typeof parsed.symptoms === 'object') ? parsed.symptoms : {}
        };
      } catch (e) {
        console.warn('[Plan4U CycleTracker] Failed to parse saved data:', e);
        return defaultData;
      }
    }

    saveData() {
      if (!this.storage) return;
      try {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.saveFile === 'function') {
          window.Plan4UStorage.saveFile('cycle.json', this.data);
        }
      } catch (e) {
        console.warn('[Plan4U CycleTracker] Failed to save cycle data:', e);
      }
    }

    async hydrateFromStorage() {
      try {
        if (typeof window !== 'undefined' && window.Plan4UStorage && typeof window.Plan4UStorage.loadFile === 'function') {
          const fileData = await window.Plan4UStorage.loadFile('cycle.json', null);
          if (fileData && typeof fileData === 'object') {
            const currentHistoryCount = Array.isArray(this.data.history) ? this.data.history.length : 0;
            const fileHistoryCount = Array.isArray(fileData.history) ? fileData.history.length : 0;
            if (fileHistoryCount > currentHistoryCount || (fileData.settings && fileData.settings.enabled && !this.data.settings.enabled)) {
              this.data = {
                settings: { ...(this.data.settings || {}), ...(fileData.settings || {}) },
                history: (Array.isArray(fileData.history) && fileData.history.length > 0) ? fileData.history : this.data.history,
                symptoms: { ...(this.data.symptoms || {}), ...(fileData.symptoms || {}) }
              };
              if (this.storage) {
                this.storage.setItem(STORAGE_KEY, JSON.stringify(this.data));
              }
              return true;
            }
          }
        }
      } catch (e) {
        console.warn('[Plan4U CycleTracker] Hydration error:', e);
      }
      return false;
    }

    _sortAndSave() {
      this.data.history.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
      this.saveData();
    }

    // --- Управление настройками ---
    getSettings() {
      return { ...this.data.settings };
    }

    updateSettings(newSettings) {
      this.data.settings = { ...this.data.settings, ...newSettings };
      this.saveData();
      return this.getSettings();
    }

    isEnabled() {
      return !!this.data.settings.enabled;
    }

    // --- Управление записями циклов ---
    getHistory() {
      return [...this.data.history].sort((a, b) => (b.startDate > a.startDate ? 1 : -1));
    }

    getLatestCycle() {
      return this.getHistory()[0] || null;
    }

    addCycle(startDate, endDate = null, isOutlier = false, ovulationDate = null, notes = '') {
      if (!startDate || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
        throw new Error('Invalid startDate format (expected YYYY-MM-DD)');
      }

      const existingIdx = this.data.history.findIndex(c => c.startDate === startDate);
      const periodLen = this.data.settings.periodLength || 5;
      const actualEndDate = endDate || addDays(startDate, periodLen - 1);

      const cycleRecord = {
        id: existingIdx >= 0 ? this.data.history[existingIdx].id : 'cycle_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        startDate,
        endDate: actualEndDate,
        periodEndedExplicitly: endDate !== null,
        isOutlier: !!isOutlier,
        ovulationDate: ovulationDate || null,
        notes: notes || ''
      };

      if (existingIdx >= 0) {
        this.data.history[existingIdx] = cycleRecord;
      } else {
        this.data.history.push(cycleRecord);
      }

      this._sortAndSave();
      return cycleRecord;
    }

    updateCycle(id, fields) {
      const idx = this.data.history.findIndex(c => c.id === id);
      if (idx === -1) return null;
      this.data.history[idx] = { ...this.data.history[idx], ...fields };
      this._sortAndSave();
      return this.data.history[idx];
    }

    deleteCycle(id) {
      this.data.history = this.data.history.filter(c => c.id !== id);
      this.saveData();
    }

    clearAllHistory() {
      this.data.history = [];
      this.saveData();
    }

    toggleOutlier(id) {
      const cycle = this.data.history.find(c => c.id === id);
      if (!cycle) return false;
      cycle.isOutlier = !cycle.isOutlier;
      this.saveData();
      return cycle.isOutlier;
    }

    // Быстрая отметка: "Сегодня начался новый цикл"
    recordTodayAsStart() {
      return this.addCycle(getTodayString());
    }

    // Быстрая отметка: "Сегодня закончились месячные"
    recordTodayAsEnd(dateStr = null) {
      const today = dateStr || getTodayString();
      const current = this.getLatestCycle();
      if (!current) return null;

      const actualEnd = today >= current.startDate ? today : current.startDate;
      current.endDate = actualEnd;
      current.periodEndedExplicitly = true;

      const actualLen = diffInDays(current.startDate, actualEnd) + 1;
      if (actualLen >= 2 && actualLen <= 10) {
        this.data.settings.periodLength = Math.round((this.data.settings.periodLength + actualLen) / 2);
      }

      this.saveData();
      return current;
    }

    // Проверяет, идет ли прямо сейчас менструация в текущем цикле
    isPeriodCurrentlyActive(referenceDateStr = null) {
      const today = referenceDateStr || getTodayString();
      const latest = this.getLatestCycle();
      if (!latest || latest.periodEndedExplicitly) return false;
      const daysSinceStart = diffInDays(latest.startDate, today);
      return daysSinceStart >= 0 && daysSinceStart <= 9;
    }

    // Быстрая отметка: "Отметить овуляцию для текущего цикла"
    setOvulationDateForCurrentCycle(dateStr = null) {
      const current = this.getLatestCycle();
      if (!current) return null;
      current.ovulationDate = dateStr || getTodayString();
      this.saveData();
      return current;
    }

    // --- Управление симптомами дня ---
    getSymptomsForDate(dateStr) {
      return this.data.symptoms[dateStr] || null;
    }

    setSymptomsForDate(dateStr, symptomsObj) {
      if (!this.data.symptoms) this.data.symptoms = {};
      if (!symptomsObj || Object.keys(symptomsObj).length === 0) {
        delete this.data.symptoms[dateStr];
      } else {
        this.data.symptoms[dateStr] = {
          ...(this.data.symptoms[dateStr] || {}),
          ...symptomsObj,
          updatedAt: Date.now()
        };
      }
      this.saveData();
      return this.data.symptoms[dateStr] || null;
    }

    // =========================================================================
    //  МАТЕМАТИЧЕСКАЯ МОДЕЛЬ ПРОГНОЗИРОВАНИЯ (ДЛЯ НЕРЕГУЛЯРНЫХ ЦИКЛОВ)
    // =========================================================================

    analyzeCycleLengths() {
      const sorted = [...this.data.history].sort((a, b) => (a.startDate > b.startDate ? 1 : -1));
      const validLengths = [], allLengths = [];

      for (let i = 0; i < sorted.length - 1; i++) {
        const cur = sorted[i], next = sorted[i + 1];
        const len = diffInDays(cur.startDate, next.startDate);
        if (len >= 15 && len <= 90) {
          allLengths.push(len);
          if (!cur.isOutlier) validLengths.push(len);
        }
      }

      const activeLengths = validLengths.length > 0 ? validLengths : allLengths;
      const userBase = this.data.settings.defaultCycleLength || 28;
      let median, minLen, maxLen;

      if (activeLengths.length === 0) {
        median = userBase;
        minLen = Math.max(userBase - 3, 20);
        maxLen = Math.min(userBase + 6, 45);
      } else if (activeLengths.length === 1) {
        median = Math.round((activeLengths[0] + userBase) / 2);
        minLen = Math.min(activeLengths[0], userBase - 2);
        maxLen = Math.max(activeLengths[0], userBase + 3);
      } else {
        median = Math.round(calculateMedian(activeLengths));
        minLen = Math.min(...activeLengths);
        maxLen = Math.max(...activeLengths);
      }

      return {
        count: activeLengths.length,
        totalCycles: sorted.length,
        validLengths: activeLengths,
        median,
        minLen,
        maxLen,
        range: maxLen - minLen,
        isHighVariability: activeLengths.length >= 2 && (maxLen - minLen >= 7),
        userBase
      };
    }

    getPrediction(referenceDateStr = null) {
      const latest = this.getLatestCycle();
      if (!latest) return null;

      const analysis = this.analyzeCycleLengths();
      const luteal = this.data.settings.lutealLength || 14;
      const isIrregular = this.data.settings.isIrregular || analysis.isHighVariability;
      const periodLen = this.data.settings.periodLength || 5;
      const userBase = this.data.settings.defaultCycleLength || 28;

      let windowStart = '', windowEnd = '', predictedCenter = '', isOvulationOverride = false;

      if (latest.ovulationDate && latest.ovulationDate >= latest.startDate) {
        isOvulationOverride = true;
        predictedCenter = addDays(latest.ovulationDate, luteal);
        windowStart = addDays(predictedCenter, -1);
        windowEnd = addDays(predictedCenter, +1);
      } else if (isIrregular) {
        if (analysis.count >= 2) {
          windowStart = addDays(latest.startDate, analysis.minLen);
          windowEnd = addDays(latest.startDate, analysis.maxLen);
          predictedCenter = addDays(latest.startDate, analysis.median);
        } else {
          windowStart = addDays(latest.startDate, userBase - 3);
          windowEnd = addDays(latest.startDate, userBase + 6);
          predictedCenter = addDays(latest.startDate, userBase);
        }
      } else {
        const targetLen = (analysis.count >= 3 && Math.abs(analysis.median - userBase) <= 2) ? analysis.median : userBase;
        predictedCenter = addDays(latest.startDate, targetLen);
        windowStart = addDays(predictedCenter, -1);
        windowEnd = addDays(predictedCenter, +1);
      }

      const effectiveCycleLen = (!isIrregular && analysis.count < 3) ? userBase : (analysis.count >= 2 ? analysis.median : userBase);
      const estOvulationCenter = isOvulationOverride
        ? latest.ovulationDate
        : addDays(latest.startDate, Math.max(effectiveCycleLen - luteal, periodLen + 2));

      return {
        lastCycleStart: latest.startDate,
        windowStart,
        windowEnd,
        predictedCenter,
        predictedEnd: addDays(predictedCenter, periodLen - 1),
        isOvulationOverride,
        isIrregular,
        fertileStart: addDays(estOvulationCenter, -3),
        fertileEnd: addDays(estOvulationCenter, +1),
        estOvulationCenter,
        medianLength: analysis.median,
        minLen: analysis.minLen,
        maxLen: analysis.maxLen,
        historyCount: analysis.count,
        defaultCycleLength: userBase
      };
    }

    getStatusForDate(dateStr = null) {
      const curDateStr = dateStr || getTodayString();
      const latest = this.getLatestCycle();
      if (!latest) {
        return { hasData: false, dayInCycle: 0, phase: 'unknown', inWindow: false, isOverdue: false, daysUntilWindow: 0 };
      }

      const dayInCycle = diffInDays(latest.startDate, curDateStr) + 1;
      const prediction = this.getPrediction(curDateStr);
      const isPeriodDay = curDateStr >= latest.startDate && curDateStr <= latest.endDate;

      const phase = isPeriodDay ? 'menstrual'
        : (prediction && curDateStr >= prediction.fertileStart && curDateStr <= prediction.fertileEnd) ? 'ovulation'
        : (prediction && curDateStr > prediction.fertileEnd) ? 'luteal' : 'follicular';

      const inWindow = !!(prediction && curDateStr >= prediction.windowStart && curDateStr <= prediction.windowEnd);
      const isOverdue = !!(prediction && curDateStr > prediction.windowEnd);
      const daysUntilWindow = (prediction && curDateStr < prediction.windowStart) ? diffInDays(curDateStr, prediction.windowStart) : 0;

      return {
        hasData: true,
        dayInCycle,
        curDateStr,
        latestCycle: latest,
        phase,
        isPeriodDay,
        inWindow,
        isOverdue,
        daysUntilWindow,
        prediction
      };
    }

    getDayClassification(dateStr) {
      const result = { isPeriod: false, isPredictedWindow: false, isOvulation: false, isFertile: false, cycleDay: null };
      if (!this.isEnabled()) return result;

      for (const cycle of this.data.history) {
        if (dateStr >= cycle.startDate && dateStr <= cycle.endDate) {
          result.isPeriod = true;
          result.cycleDay = diffInDays(cycle.startDate, dateStr) + 1;
          break;
        }
        if (cycle.ovulationDate === dateStr) result.isOvulation = true;
      }

      const p = this.getPrediction();
      if (p) {
        if (dateStr >= p.windowStart && dateStr <= p.windowEnd) result.isPredictedWindow = true;
        if (dateStr === p.estOvulationCenter) result.isOvulation = true;
        else if (dateStr >= p.fertileStart && dateStr <= p.fertileEnd) result.isFertile = true;
      }
      return result;
    }

    determineSubPhase(phase, dayInCycle = 1, context = {}) {
      if (context.isOverdue || context.inWindow) return 'overdue_window';
      if (phase === 'menstrual') return dayInCycle <= 2 ? 'menstrual_early' : 'menstrual_late';
      if (phase === 'ovulation') return 'ovulation';
      if (phase === 'luteal') {
        return (dayInCycle >= 22 || (context.daysUntilWindow !== undefined && context.daysUntilWindow <= 5)) ? 'luteal_late' : 'luteal_early';
      }
      return dayInCycle >= 10 ? 'follicular_late' : 'follicular_early';
    }

    getOrbitData(dateStr) {
      const status = this.getStatusForDate(dateStr);
      const prediction = this.getPrediction(dateStr);
      const settings = this.getSettings();

      const totalDays = Math.max(20, (prediction && prediction.estimatedCycleLength)
        ? prediction.estimatedCycleLength
        : (settings.defaultCycleLength || 28));

      if (!status || !status.hasData) {
        return { hasData: false, totalDays, currentDay: null, pointerAngleDeg: 0, segments: [] };
      }

      const currentDay = status.dayInCycle;
      const pointerAngleDeg = Math.min(360, Math.max(0, (currentDay - 0.5) * (360 / totalDays)));

      const periodLen = Math.min(settings.periodLength || 5, Math.floor(totalDays * 0.3));
      const lutealLen = settings.lutealLength || 14;
      const ovCenter = Math.max(periodLen + 2, totalDays - lutealLen);
      const ovStart = Math.max(periodLen + 1, ovCenter - 1);
      const ovEnd = Math.min(totalDays - 2, ovCenter + 1);

      const segments = [
        ['menstrual', 1, periodLen, '#fb7185'],
        ['follicular', periodLen + 1, ovStart - 1, '#34d399'],
        ['ovulation', ovStart, ovEnd, '#fbbf24'],
        ['luteal', ovEnd + 1, totalDays, '#a78bfa']
      ].map(([key, startDay, endDay, color]) => ({
        key, startDay, endDay, days: Math.max(1, endDay - startDay + 1), color
      }));

      return {
        hasData: true,
        totalDays,
        currentDay,
        pointerAngleDeg,
        phase: status.phase,
        segments
      };
    }

    getPhaseAdvice(phase, lang = 'ru', dayInCycle = 1, context = {}) {
      const langDict = ADVICE_DATA[lang] || ADVICE_DATA.ru;
      const subPhase = this.determineSubPhase(phase, dayInCycle, context);
      const subData = langDict[subPhase] || langDict.follicular_early || langDict.menstrual_early;

      return {
        title: subData.title || '',
        energy: pick(subData.energies, subData.energy || ''),
        taskTip: pick(subData.taskTips, subData.taskTip || ''),
        badge: subData.badge || ''
      };
    }

    // Проверка активности синергии с питанием на указанную дату
    isLutealNutritionBoostActive(dateStr = null) {
      if (!this.isEnabled() || !this.data.settings.lutealNutritionSync) return false;
      const status = this.getStatusForDate(dateStr);
      if (!status || !status.hasData) return false;
      return status.phase === 'luteal';
    }

    // Детальный статус кросс-модульной синергии для интерфейса
    getLutealSynergyStatus(dateStr = null) {
      const curDateStr = dateStr || getTodayString();
      const isEnabled = this.isEnabled();
      const isSyncOn = !!this.data.settings.lutealNutritionSync;
      const boostPct = Number(this.data.settings.lutealBoostPercent) || 10;

      if (!isEnabled) {
        return {
          active: false,
          isBoosted: false,
          reason: 'cycle_disabled',
          boostPct,
          phase: 'unknown',
          dayInCycle: 0
        };
      }

      if (!isSyncOn) {
        return {
          active: false,
          isBoosted: false,
          reason: 'disabled',
          boostPct,
          phase: 'unknown',
          dayInCycle: 0
        };
      }

      const status = this.getStatusForDate(curDateStr);
      if (!status || !status.hasData) {
        return {
          active: true,
          isBoosted: false,
          reason: 'no_cycle_data',
          boostPct,
          phase: 'unknown',
          dayInCycle: 0
        };
      }

      const isLuteal = status.phase === 'luteal';
      return {
        active: true,
        isBoosted: isLuteal,
        reason: isLuteal ? 'luteal_phase' : 'other_phase',
        boostPct,
        phase: status.phase,
        dayInCycle: status.dayInCycle
      };
    }

    getLutealNutritionAdvice(dateStr = null, lang = 'ru') {
      const activeLang = ADVICE_DATA[lang] ? lang : (ADVICE_DATA.ru ? 'ru' : 'en');
      const phrases = ADVICE_DATA[activeLang]?.luteal_nutrition || ADVICE_DATA.ru.luteal_nutrition;
      return pick(phrases, "Лютеиновая фаза: норма калорий бережно повышена для твоего комфорта 🌸");
    }
  }

  return {
    CycleTracker,
    calculateMedian,
    addDays,
    diffInDays,
    formatDate,
    parseDate,
    STORAGE_KEY,
    DEFAULT_SETTINGS
  };
}));
