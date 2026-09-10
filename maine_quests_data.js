/**
 * Plan4U - Maine Coon Secret Quests Catalog ("Записки лапкой")
 * 
 * 100 playful, cozy, self-care, family, and feline-inspired secret tasks from Maine.
 * Complete with authentic translations in Russian (ru), Ukrainian (uk), and English (en).
 */

(function () {
  'use strict';

  const MAINE_QUESTS_DATA = [
    // =========================================================================
    // I. КОШАЧИЙ ДЗЕН И ПОВАДКИ / CAT ZEN & FELINE HABITS (1-20)
    // =========================================================================
    {
      id: 'mq_001',
      category: 'zen',
      ru: 'Сладко потянуться всем телом: сначала передними лапками, потом задними 🐾',
      uk: 'Солодко потягнутися всім тілом: спочатку передніми лапками, потім задніми 🐾',
      en: 'Stretch sweetly with your whole body: front paws first, then back paws 🐾'
    },
    {
      id: 'mq_002',
      category: 'zen',
      ru: 'Найти солнечный лучик в комнате и посидеть в нём ровно две минуты 🐾',
      uk: 'Знайти сонячний промінчик у кімнаті й посидіти в ньому рівно дві хвилини 🐾',
      en: 'Find a sunbeam in the room and sit in it for exactly two minutes 🐾'
    },
    {
      id: 'mq_003',
      category: 'zen',
      ru: 'Полежать 5 минут клубочком на самом мягком пледе без телефона 🐾',
      uk: 'Полежати 5 хвилин клубочком на найм’якішому пледі без телефона 🐾',
      en: 'Curl up like a ball on the softest blanket for 5 minutes without your phone 🐾'
    },
    {
      id: 'mq_004',
      category: 'zen',
      ru: 'Зажмуриться, медленно моргнуть и подумать о чём-то очень тёплом 🐾',
      uk: 'Заплющити очі, повільно кліпнути й подумати про щось дуже тепле 🐾',
      en: 'Slow-blink like a happy cat and think about something truly warm 🐾'
    },
    {
      id: 'mq_005',
      category: 'zen',
      ru: 'Найти большую пустую коробку и хотя бы задумчиво на неё посмотреть 🐾',
      uk: 'Знайти велику порожню коробку й хоча б замислено на неї подивитися 🐾',
      en: 'Find a big empty cardboard box and inspect it thoughtfully like a cat 🐾'
    },
    {
      id: 'mq_006',
      category: 'zen',
      ru: 'Сделать вид, что тебя не существует, когда кто-то зовёт делать сложные дела 🐾',
      uk: 'Удати, ніби тебе не існує, коли хтось кличе робити складні справи 🐾',
      en: 'Pretend you do not exist when someone calls you to do complicated chores 🐾'
    },
    {
      id: 'mq_007',
      category: 'zen',
      ru: 'Посидеть у окошка и понаблюдать за птицами или прохожими 🐾',
      uk: 'Посидіти біля віконця й поспостерігати за пташками або перехожими 🐾',
      en: 'Sit by the window and watch birds or passersby with quiet curiosity 🐾'
    },
    {
      id: 'mq_008',
      category: 'zen',
      ru: 'Почесать себя за ушком или ласково погладить свои волосы 🐾',
      uk: 'Почухати себе за вушком або лагідно погладити своє волосся 🐾',
      en: 'Gently scratch behind your ear or stroke your hair affectionately 🐾'
    },
    {
      id: 'mq_009',
      category: 'zen',
      ru: 'Выбрать самый тёплый свитер или плед и закутаться в него в позе шаурмы 🐾',
      uk: 'Вибрати найтепліший светр або плед і загорнутися в нього, як шаурма 🐾',
      en: 'Wrap yourself into a warm burrito using the coziest blanket or sweater 🐾'
    },
    {
      id: 'mq_010',
      category: 'zen',
      ru: 'Зевать сладко и во весь рот, совершенно не стесняясь 🐾',
      uk: 'Позіхнути солодко й на повний рот, зовсім не соромлячись 🐾',
      en: 'Yawn as widely and comfortably as an unbothered feline 🐾'
    },
    {
      id: 'mq_011',
      category: 'zen',
      ru: 'Тихо сказать «Мяу» вслух, просто чтобы проверить акустику в комнате 🐾',
      uk: 'Тихенько сказати «Няв» вголос, просто щоб перевірити акустику в кімнаті 🐾',
      en: 'Say a quiet "Meow" out loud just to test the room acoustics 🐾'
    },
    {
      id: 'mq_012',
      category: 'zen',
      ru: 'Потоптаться ножками на коврике или мягком пледе, как котик месит тесто 🐾',
      uk: 'Потупцювати ніжками на килимку або м’якому пледі, ніби котик мне тісто 🐾',
      en: 'Make biscuits with your feet or hands on a soft blanket 🐾'
    },
    {
      id: 'mq_013',
      category: 'zen',
      ru: 'Найти самое высокое место в комнате и гордо обозревать свои владения 🐾',
      uk: 'Знайти найвище доступне місце в кімнаті й гордо оглядати свої володіння 🐾',
      en: 'Climb onto the highest comfortable perch and survey your kingdom 🐾'
    },
    {
      id: 'mq_014',
      category: 'zen',
      ru: 'Спрятаться под одеяло с головой ровно на три минуты 🐾',
      uk: 'Сховатися під ковдру з головою рівно на три хвилини 🐾',
      en: 'Hide under the blanket head-first for three minutes of complete peace 🐾'
    },
    {
      id: 'mq_015',
      category: 'zen',
      ru: 'Подозрительно посмотреть на закрытую дверь, пока кто-нибудь её не откроет 🐾',
      uk: 'Підозріло подивитися на зачинені двері, поки хтось їх не відчинить 🐾',
      en: 'Stare intensely at a closed door until someone feels compelled to open it 🐾'
    },
    {
      id: 'mq_016',
      category: 'zen',
      ru: 'Сделать невозмутимый вид кота-аристократа на 30 секунд 🐾',
      uk: 'Зробити незворушний вигляд кота-аристократа на 30 секунд 🐾',
      en: 'Hold an aristocratic, unimpressed cat face for 30 seconds 🐾'
    },
    {
      id: 'mq_017',
      category: 'zen',
      ru: 'Устроить себе официальный «кошачий час дневного дрёма» на 15 минут 🐾',
      uk: 'Влаштувати собі офіційну «котячу годину денного сну» на 15 хвилин 🐾',
      en: 'Take an official 15-minute power catnap without any alarm guilt 🐾'
    },
    {
      id: 'mq_018',
      category: 'zen',
      ru: 'Подойти к открытому окну и вдохнуть свежий уличный воздух 🐾',
      uk: 'Підійти до відчиненого вікна й вдихнути свіже вуличне повітря 🐾',
      en: 'Step up to the window and breathe in fresh outdoor air with curious whiskers 🐾'
    },
    {
      id: 'mq_019',
      category: 'zen',
      ru: 'Раскинуть руки и ноги морской звездой на кровати 🐾',
      uk: 'Розкинути руки й ноги морською зіркою на ліжку 🐾',
      en: 'Flop onto the bed and stretch out like a relaxed starfish 🐾'
    },
    {
      id: 'mq_020',
      category: 'zen',
      ru: 'Позволить себе 10 минут ничего не делать — коты никогда не чувствуют вины 🐾',
      uk: 'Дозволити собі 10 хвилин нічого не робити — коти ніколи не відчувають провини 🐾',
      en: 'Do absolutely nothing for 10 minutes — cats never feel guilty about resting 🐾'
    },

    // =========================================================================
    // II. ЛЮБОВЬ, СЕМЬЯ И БЛИЗКИЕ / LOVE, FAMILY & DEAR ONES (21-40)
    // =========================================================================
    {
      id: 'mq_021',
      category: 'family',
      ru: 'Подойти к близкому человеку и крепко-крепко обнять его без всякого повода 🐾',
      uk: 'Підійти до близької людини й міцно-міцно обійняти її без жодного приводу 🐾',
      en: 'Walk up to someone you care about and give them a warm hug for no reason 🐾'
    },
    {
      id: 'mq_022',
      category: 'family',
      ru: 'Написать дорогому человеку внезапное сообщение: «Я просто о тебе подумал(а) ❤️» 🐾',
      uk: 'Написати дорогій людині раптове повідомлення: «Я просто подумав(ла) про тебе ❤️» 🐾',
      en: 'Send someone you cherish a surprise text: "Just thinking of you ❤️" 🐾'
    },
    {
      id: 'mq_023',
      category: 'family',
      ru: 'Приготовить любимому человеку или члену семьи чай/кофе с печенькой 🐾',
      uk: 'Приготувати коханій людині або члену сім’ї чай/каву з печивом 🐾',
      en: 'Make a hot cup of tea or coffee with a biscuit for a family member 🐾'
    },
    {
      id: 'mq_024',
      category: 'family',
      ru: 'Сделать близкому спонтанный лёгкий массаж плеч на пару минут 🐾',
      uk: 'Зробити близькому спонтанний легкий масаж плечей на пару хвилин 🐾',
      en: 'Give a loved one a gentle two-minute shoulder massage 🐾'
    },
    {
      id: 'mq_025',
      category: 'family',
      ru: 'Сказать близкому самый искренний и забавный комплимент 🐾',
      uk: 'Сказати близькій людині найщиріший і найкумедніший комплімент 🐾',
      en: 'Compliment someone near you with a sincere and funny compliment 🐾'
    },
    {
      id: 'mq_026',
      category: 'family',
      ru: 'Отправить родителям или бабушке/дедушке милое фото или тёплый привет 🐾',
      uk: 'Надіслати батькам або бабусі/дідусеві миле фото чи тепле вітання 🐾',
      en: 'Send parents or grandparents a sweet photo or a loving greeting 🐾'
    },
    {
      id: 'mq_027',
      category: 'family',
      ru: 'Потереться щекой о плечо любимого человека, как ласковый кот 🐾',
      uk: 'Потертися щокою об плече коханої людини, як ласкавий кіт 🐾',
      en: 'Nuzzle your cheek against your partner’s shoulder like an affectionate cat 🐾'
    },
    {
      id: 'mq_028',
      category: 'family',
      ru: 'Спросить у близкого: «Как прошёл твой день?» и выслушать, не перебивая 🐾',
      uk: 'Запитати у близького: «Як минув твій день?» і вислухати, не перебиваючи 🐾',
      en: 'Ask someone: "How was your day?" and listen with genuine care 🐾'
    },
    {
      id: 'mq_029',
      category: 'family',
      ru: 'Включить медленную песню и пригласить половинку на минутный танец посреди комнаты 🐾',
      uk: 'Увімкнути повільну пісню й запросити половинку на хвилинний танець посеред кімнати 🐾',
      en: 'Play a slow tune and slow-dance with your partner in the middle of the room 🐾'
    },
    {
      id: 'mq_030',
      category: 'family',
      ru: 'Поделиться самым вкусным кусочком своей еды с тем, кого любишь 🐾',
      uk: 'Поділитися найсмачнішим шматочком своєї їжі з тим, кого любиш 🐾',
      en: 'Share the tastiest bite of your meal with someone you love 🐾'
    },
    {
      id: 'mq_031',
      category: 'family',
      ru: 'Положить голову на колени близкому человеку и попросить погладить 🐾',
      uk: 'Покласти голову на коліна близькій людині й попросити погладити 🐾',
      en: 'Rest your head on a loved one’s lap and ask for gentle head scratches 🐾'
    },
    {
      id: 'mq_032',
      category: 'family',
      ru: 'Вспомнить и вместе посмеяться над какой-нибудь вашей старой общей историей 🐾',
      uk: 'Згадати й разом посміятися над якоюсь вашою старою спільною історією 🐾',
      en: 'Recall an old hilarious memory together and share a heartfelt laugh 🐾'
    },
    {
      id: 'mq_033',
      category: 'family',
      ru: 'Сказать детям или партнёру: «Знаешь, ты у меня самое большое сокровище» 🐾',
      uk: 'Сказати дітям або партнеру: «Знаєш, ти в мене найбільший скарб» 🐾',
      en: 'Tell your kids or partner: "You know, you are truly my greatest treasure" 🐾'
    },
    {
      id: 'mq_034',
      category: 'family',
      ru: 'Отправить другу или подруге смешной добрый мем с котиками 🐾',
      uk: 'Надіслати другові чи подрузі смішний добрий мем із котиками 🐾',
      en: 'Send a friend a hilarious and wholesome cat meme to brighten their day 🐾'
    },
    {
      id: 'mq_035',
      category: 'family',
      ru: 'Устроить вечерний уютный просмотр фильма с большой миской вкусняшек 🐾',
      uk: 'Влаштувати вечірній затишний перегляд фільму з великою мискою смаколиків 🐾',
      en: 'Plan a cozy movie night with a bowl of treats for you and your household 🐾'
    },
    {
      id: 'mq_036',
      category: 'family',
      ru: 'Написать маленькую добрую записку на стикере и спрятать в карман близкому 🐾',
      uk: 'Написати маленьку добру записку на стікері й сховати в кишеню близькому 🐾',
      en: 'Write a tiny sweet note on a sticker and slip it into a loved one’s pocket 🐾'
    },
    {
      id: 'mq_037',
      category: 'family',
      ru: 'Просто подержать дорогого человека за руку в тишине 🐾',
      uk: 'Просто потримати дорогу людину за руку в тиші 🐾',
      en: 'Hold hands with someone special in peaceful, comfortable silence 🐾'
    },
    {
      id: 'mq_038',
      category: 'family',
      ru: 'Поблагодарить близкого за какую-нибудь бытовую мелочь, которую обычно не замечают 🐾',
      uk: 'Подякувати близькому за якусь побутову дрібницю, яку зазвичай не помічають 🐾',
      en: 'Thank someone for a small everyday chore that usually goes unnoticed 🐾'
    },
    {
      id: 'mq_039',
      category: 'family',
      ru: 'Улыбнуться прохожему или соседу в подъезде просто так 🐾',
      uk: 'Посміхнутися перехожому або сусідові в під’їзді просто так 🐾',
      en: 'Offer a genuine friendly smile to a neighbor or passerby today 🐾'
    },
    {
      id: 'mq_040',
      category: 'family',
      ru: 'Позвонить старому доброму другу, с которым давно не слышались 🐾',
      uk: 'Зателефонувати старому доброму другові, з яким давно не чулися 🐾',
      en: 'Call an old dear friend you haven’t chatted with in a while 🐾'
    },

    // =========================================================================
    // III. ЗАБОТА О ТЕЛЕ И ЗДОРОВЬЕ / BODY CARE & HEALTH (41-60)
    // =========================================================================
    {
      id: 'mq_041',
      category: 'health',
      ru: 'Не спеша выпить большой стакан чистой тёплой воды (можно с лимоном) 🐾',
      uk: 'Не поспішаючи випити велику склянку чистої теплої води (можна з лимоном) 🐾',
      en: 'Slowly drink a tall glass of clean water (add lemon if you like) 🐾'
    },
    {
      id: 'mq_042',
      category: 'health',
      ru: 'Оторвать взгляд от экрана, посмотреть вдаль за окно и поморгать 20 раз 🐾',
      uk: 'Відірвати погляд від екрана, подивитися вдалину за вікно й кліпнути 20 разів 🐾',
      en: 'Look away from the screen, gaze into the distance and blink 20 times 🐾'
    },
    {
      id: 'mq_043',
      category: 'health',
      ru: 'Выпрямить спину, расправить плечи и почувствовать себя грациозным леопардом 🐾',
      uk: 'Випрямити спину, розправити плечі й відчути себе граційним леопардом 🐾',
      en: 'Straighten your back, roll shoulders back, and feel like a graceful leopard 🐾'
    },
    {
      id: 'mq_044',
      category: 'health',
      ru: 'Скушать сочное яблоко, мандарин или горсть свежих ягод 🐾',
      uk: 'З’їсти соковите яблуко, мандарин або жменю свіжих ягід 🐾',
      en: 'Enjoy a crisp apple, tangerine, or a handful of fresh berries 🐾'
    },
    {
      id: 'mq_045',
      category: 'health',
      ru: 'Умыть лицо приятной прохладной бодрящей водой 🐾',
      uk: 'Умити обличчя приємною прохолодною підбадьорливою водою 🐾',
      en: 'Splash refreshing cool water on your face for an instant glow 🐾'
    },
    {
      id: 'mq_046',
      category: 'health',
      ru: 'Сделать 10 мягких наклонов головы вправо-влево, разминая шею 🐾',
      uk: 'Зробити 10 м’яких нахилів голови вправо-вліво, розминаючи шию 🐾',
      en: 'Do 10 gentle neck rolls side to side to release stiffness 🐾'
    },
    {
      id: 'mq_047',
      category: 'health',
      ru: 'Помассировать себе виски и пальчики рук с ароматным кремом 🐾',
      uk: 'Помасажувати собі скроні та пальчики рук із ароматним кремом 🐾',
      en: 'Massage your temples and fingertips using a fragrant hand lotion 🐾'
    },
    {
      id: 'mq_048',
      category: 'health',
      ru: 'Выйти на улицу и пройтись хотя бы 15 минут спокойным шагом 🐾',
      uk: 'Вийти на вулицю й пройтися хоча б 15 хвилин спокійною ходою 🐾',
      en: 'Step outside for a peaceful 15-minute walk without rushing anywhere 🐾'
    },
    {
      id: 'mq_049',
      category: 'health',
      ru: 'Сделать глубокий вдох животом на 4 счёта и плавный выдох на 6 счетов (трижды) 🐾',
      uk: 'Зробити глибокий вдих животом на 4 рахунки й плавний видих на 6 рахунків (тричі) 🐾',
      en: 'Inhale deeply into your belly for 4 counts, exhale smoothly for 6 (repeat 3x) 🐾'
    },
    {
      id: 'mq_050',
      category: 'health',
      ru: 'Покрутить стопами и пошевелить пальчиками ног после долгого сидения 🐾',
      uk: 'Покрутити стопами й поворушити пальчиками ніг після довгого сидіння 🐾',
      en: 'Wiggle your toes and rotate your ankles after sitting for a while 🐾'
    },
    {
      id: 'mq_051',
      category: 'health',
      ru: 'Съесть свой обед осознанно — без соцсетей и коротких видео 🐾',
      uk: 'З’їсти свій обід усвідомлено — без соцмереж та коротких відео 🐾',
      en: 'Enjoy your meal mindfully without scrolling feeds or watching videos 🐾'
    },
    {
      id: 'mq_052',
      category: 'health',
      ru: 'Сделать 15 лёгких приседаний для бодрости хвоста 🐾',
      uk: 'Зробити 15 легких присідань для бадьорості хвоста 🐾',
      en: 'Perform 15 gentle squats to energize your tail and legs 🐾'
    },
    {
      id: 'mq_053',
      category: 'health',
      ru: 'Заварить ароматный травяной чай с мятой, ромашкой или мелиссой 🐾',
      uk: 'Заварити ароматний трав’яний чай із м’ятою, ромашкою або мелісою 🐾',
      en: 'Brew a calming cup of herbal tea with mint, chamomile, or lemon balm 🐾'
    },
    {
      id: 'mq_054',
      category: 'health',
      ru: 'Полежать с закрытыми глазами ровно пять минут посреди рабочего дня 🐾',
      uk: 'Полежати із заплющеними очима рівно п’ять хвилин посеред робочого дня 🐾',
      en: 'Rest with your eyes closed for 5 quiet minutes midway through the day 🐾'
    },
    {
      id: 'mq_055',
      category: 'health',
      ru: 'Сделать кошачью растяжку: прогнуть спинку вверх и вниз 🐾',
      uk: 'Зробити котячу розтяжку: прогнути спинку вгору та вниз 🐾',
      en: 'Do the cat-cow stretch: arch your back upward then curve downward gently 🐾'
    },
    {
      id: 'mq_056',
      category: 'health',
      ru: 'Открыть настежь окно и проветрить комнату бодрящим свежим воздухом 🐾',
      uk: 'Відчинити навстіж вікно й провітрити кімнату свіжим підбадьорливим повітрям 🐾',
      en: 'Open the window wide and let in a crisp rush of clean air 🐾'
    },
    {
      id: 'mq_057',
      category: 'health',
      ru: 'Принять тёплый душ с любимым пенящимся гелем 🐾',
      uk: 'Прийняти теплий душ із улюбленим пінним гелем 🐾',
      en: 'Enjoy a warm shower with your favorite soothing body wash 🐾'
    },
    {
      id: 'mq_058',
      category: 'health',
      ru: 'Убрать телефон подальше за полчаса до сна и дать глазкам отдохнуть 🐾',
      uk: 'Прибрати телефон подалі за пів години до сну й дати оченятам відпочити 🐾',
      en: 'Put your phone away 30 minutes before bedtime and let your eyes relax 🐾'
    },
    {
      id: 'mq_059',
      category: 'health',
      ru: 'Сделать себе питательный и вкусный перекус вместо сухомятки 🐾',
      uk: 'Зробити собі поживний і смачний перекус замість сухохом’ятки 🐾',
      en: 'Fix yourself a nourishing, wholesome snack instead of dry chips 🐾'
    },
    {
      id: 'mq_060',
      category: 'health',
      ru: 'Положить руку на сердце и порадоваться, как ровно и надёжно оно стучит 🐾',
      uk: 'Покласти руку на серце й порадіти, як рівно й надійно воно стукає 🐾',
      en: 'Place a hand over your heart and appreciate its steady, faithful beat 🐾'
    },

    // =========================================================================
    // IV. ШАЛОСТИ, РАДОСТЬ И САМООЦЕНКА / PLAYFULNESS, JOY & SELF-WORTH (61-80)
    // =========================================================================
    {
      id: 'mq_061',
      category: 'fun',
      ru: 'Подойти к зеркалу, подмигнуть своему отражению и сказать: «Ну каков(а) красавец/красавица!» 🐾',
      uk: 'Підійти до дзеркала, підморгнути собі й сказати: «Яка ж краса!» 🐾',
      en: 'Wink at your mirror reflection and say: "Looking absolutely marvelous!" 🐾'
    },
    {
      id: 'mq_062',
      category: 'fun',
      ru: 'Включить любимый зажигательный трек и станцевать дурацкий победный танец 🐾',
      uk: 'Увімкнути улюблений запальний трек і станцювати кумедний переможний танець 🐾',
      en: 'Blast your favorite upbeat jam and dance silly for three minutes 🐾'
    },
    {
      id: 'mq_063',
      category: 'fun',
      ru: 'Сказать вслух три вещи, за которые ты собой гордишься на этой неделе 🐾',
      uk: 'Сказати вголос три речі, якими ти пишаєшся в собі на цьому тижні 🐾',
      en: 'Name three things out loud that you are genuinely proud of this week 🐾'
    },
    {
      id: 'mq_064',
      category: 'fun',
      ru: 'Купить или взять себе ту самую мелкую приятную вкусняшку, которую давно хотелось 🐾',
      uk: 'Купити або взяти собі той самий дрібний приємний смаколик, якого давно хотілося 🐾',
      en: 'Treat yourself to that little delight you’ve been craving 🐾'
    },
    {
      id: 'mq_065',
      category: 'fun',
      ru: 'Напевать весёлую задорную мелодию себе под нос во время готовки или уборки 🐾',
      uk: 'Мугикати веселу бадьору мелодію собі під ніс під час готування чи прибирання 🐾',
      en: 'Hum a cheerful tune under your breath while doing mundane chores 🐾'
    },
    {
      id: 'mq_066',
      category: 'fun',
      ru: 'Придумать смешную кличку бытовому прибору (например, «Сэр Пылесос III») 🐾',
      uk: 'Вигадати кумедну кличку побутовому приладу (наприклад, «Сер Пилосос III») 🐾',
      en: 'Invent a goofy noble nickname for a home gadget (like "Sir Vacuum III") 🐾'
    },
    {
      id: 'mq_067',
      category: 'fun',
      ru: 'Разрешить себе съесть десерт перед основной едой, нарушив все скучные правила 🐾',
      uk: 'Дозволити собі з’їсти десерт перед основною стравою, порушивши нудні правила 🐾',
      en: 'Eat dessert before dinner just once, breaking all boring grown-up rules 🐾'
    },
    {
      id: 'mq_068',
      category: 'fun',
      ru: 'Нарисовать забавную кошачью мордочку на стикере и приклеить на видное место 🐾',
      uk: 'Намалювати кумедну котячу мордочку на стікері й приклеїти на видне місце 🐾',
      en: 'Doodle a funny cat face on a sticky note and put it where you can see it 🐾'
    },
    {
      id: 'mq_069',
      category: 'fun',
      ru: 'Рассказать добрый анекдот или смешную историю близким или коллегам 🐾',
      uk: 'Розповісти добрий анекдот або смішну історію близьким чи колегам 🐾',
      en: 'Share a wholesome joke or funny anecdote with someone nearby 🐾'
    },
    {
      id: 'mq_070',
      category: 'fun',
      ru: 'Похлопать себе в ладоши за выполнение даже самой маленькой скучной задачи 🐾',
      uk: 'Поплескати собі в долоні за виконання навіть найменшої нудної справи 🐾',
      en: 'Give yourself an audible round of applause for finishing a tiny chore 🐾'
    },
    {
      id: 'mq_071',
      category: 'fun',
      ru: 'Поиграть с питомцем веревочкой или мячиком хотя бы пять минут 🐾',
      uk: 'Погратися з улюбленцем мотузкою або м’ячиком хоча б п’ять хвилин 🐾',
      en: 'Play with your pet using a toy or string for five fun-filled minutes 🐾'
    },
    {
      id: 'mq_072',
      category: 'fun',
      ru: 'Сделать забавное селфи со смешной гримасой и сохранить на память для улыбки 🐾',
      uk: 'Зробити кумедне селфі зі смішною гримасою та зберегти на пам’ять для посмішки 🐾',
      en: 'Snap a silly face selfie and save it to your private album for laughs 🐾'
    },
    {
      id: 'mq_073',
      category: 'fun',
      ru: 'Прочитать одну главу захватывающей книги ради чистого удовольствия 🐾',
      uk: 'Прочитати один розділ захопливої книги заради чистого задоволення 🐾',
      en: 'Read one chapter of an exciting book purely for the joy of reading 🐾'
    },
    {
      id: 'mq_074',
      category: 'fun',
      ru: 'Подуть на одуванчик или пустить мыльные пузыри, если попадутся 🐾',
      uk: 'Подути на кульбабу або пустити мильні бульбашки, якщо трапляться 🐾',
      en: 'Blow a dandelion puff or soapy bubbles with childlike delight 🐾'
    },
    {
      id: 'mq_075',
      category: 'fun',
      ru: 'Сказать себе твёрдо: «Ошибаться нормально, я живой человек, а не робот!» 🐾',
      uk: 'Сказати собі впевнено: «Помилятися нормально, я жива людина, а не робот!» 🐾',
      en: 'Remind yourself firmly: "Making mistakes is okay, I am human, not a robot!" 🐾'
    },
    {
      id: 'mq_076',
      category: 'fun',
      ru: 'Послушать звуки дождя, ветра или мурлыканья котика в наушниках 🐾',
      uk: 'Послухати звуки дощу, вітру або котячого муркотіння в навушниках 🐾',
      en: 'Listen to ambient rainfall or cat purrs in your headphones for a moment 🐾'
    },
    {
      id: 'mq_077',
      category: 'fun',
      ru: 'Посмотреть короткое умилительное видео с неуклюжими пандами или котятами 🐾',
      uk: 'Подивитися коротке розчулене відео з незграбними пандами або кошенятами 🐾',
      en: 'Watch a 1-minute video of goofy kittens or clumsy pandas 🐾'
    },
    {
      id: 'mq_078',
      category: 'fun',
      ru: 'Громко и победоносно сказать «Ура!», когда завершишь сложное дело 🐾',
      uk: 'Голосно й переможно вигукнути «Ура!», коли закінчиш складну справу 🐾',
      en: 'Cheer out loud with a triumphant "Hooray!" when finishing a tough task 🐾'
    },
    {
      id: 'mq_079',
      category: 'fun',
      ru: 'Загадать доброе желание на красивую цифру на часах (например, 11:11 или 22:22) 🐾',
      uk: 'Загадати добре бажання на красиві цифри на годиннику (наприклад, 11:11 чи 22:22) 🐾',
      en: 'Make a wish on repeating clock numbers like 11:11 or 22:22 🐾'
    },
    {
      id: 'mq_080',
      category: 'fun',
      ru: 'Простить себе маленькую бытовую оплошность и отпустить её с доброй улыбкой 🐾',
      uk: 'Вибачити собі маленьку побутову помилку й відпустити її з доброю посмішкою 🐾',
      en: 'Forgive yourself for a minor mishap and let it go with a gentle smile 🐾'
    },

    // =========================================================================
    // V. ДОМАШНИЙ УЮТ И МИКРО-ПОРЯДОК / HOME COZINESS & MICRO-ORDER (81-100)
    // =========================================================================
    {
      id: 'mq_081',
      category: 'cozy',
      ru: 'Помыть кружку сразу после чая/кофе, чтобы она не грустила в раковине 🐾',
      uk: 'Помити горнятко одразу після чаю/кави, щоб воно не сумувало в раковині 🐾',
      en: 'Rinse your mug right after drinking so it doesn’t sit lonely in the sink 🐾'
    },
    {
      id: 'mq_082',
      category: 'cozy',
      ru: 'Красиво застелить кровать и взбить подушки до состояния пушистых облаков 🐾',
      uk: 'Гарно застелити ліжко та збити подушки до стану пухнастих хмаринок 🐾',
      en: 'Make your bed neatly and fluff up pillows until they feel like clouds 🐾'
    },
    {
      id: 'mq_083',
      category: 'cozy',
      ru: 'Зажечь ароматическую свечу или включить тёплый уютный ночник 🐾',
      uk: 'Запалити ароматичну свічку або увімкнути теплий затишний нічник 🐾',
      en: 'Light a scented candle or switch on a warm, ambient lamp 🐾'
    },
    {
      id: 'mq_084',
      category: 'cozy',
      ru: 'Протереть экран смартфона и монитора до кристального блеска 🐾',
      uk: 'Протерти екран смартфона та монітора до кришталевого блиску 🐾',
      en: 'Wipe your phone and laptop screens until they shine crystal clean 🐾'
    },
    {
      id: 'mq_085',
      category: 'cozy',
      ru: 'Полить домашние растения и ласково с ними поздороваться 🐾',
      uk: 'Полити кімнатні рослини та лагідно з ними привітатися 🐾',
      en: 'Water your houseplants and greet their leaves with affection 🐾'
    },
    {
      id: 'mq_086',
      category: 'cozy',
      ru: 'Навести идеальный порядок всего в одном ящичке или на одной полочке 🐾',
      uk: 'Навести ідеальний лад лише в одній шухлядці чи на одній поличці 🐾',
      en: 'Tidy up just one single drawer or shelf until it looks spotless 🐾'
    },
    {
      id: 'mq_087',
      category: 'cozy',
      ru: 'Поставить мягкие домашние тапочки на видное место, чтобы ножкам было тепло 🐾',
      uk: 'Поставити м’які домашні капці на чільне місце, щоб ніжкам було тепло 🐾',
      en: 'Place warm fuzzy slippers right where your feet can slide in easily 🐾'
    },
    {
      id: 'mq_088',
      category: 'cozy',
      ru: 'Очистить рабочий стол от лишних чашек, фантиков и ненужных бумажек 🐾',
      uk: 'Очистити робочий стіл від зайвих горняток, обгорток та непотрібних папірців 🐾',
      en: 'Clear your desk of empty cups, wrappers, and stray papers 🐾'
    },
    {
      id: 'mq_089',
      category: 'cozy',
      ru: 'Включить или собрать уютный музыкальный плейлист для спокойного вечера 🐾',
      uk: 'Увімкнути або зібрати затишний музичний плейліст для спокійного вечора 🐾',
      en: 'Turn on or compile a relaxing acoustic playlist for a peaceful evening 🐾'
    },
    {
      id: 'mq_090',
      category: 'cozy',
      ru: 'Сложить аккуратно стопку одежды на стуле (коты обожают на ней спать) 🐾',
      uk: 'Скласти охайно стопку одягу на стільці (коти обожнюють на ній спати) 🐾',
      en: 'Neatly fold clothes on the chair (a sacred nap spot for cats) 🐾'
    },
    {
      id: 'mq_091',
      category: 'cozy',
      ru: 'Положить в шкаф с вещами ароматное саше с лавандой, ванилью или кедром 🐾',
      uk: 'Покласти в шафу з речами ароматне саше з лавандою, ваніллю або кедром 🐾',
      en: 'Slip a scented sachet of lavender or cedar into your wardrobe 🐾'
    },
    {
      id: 'mq_092',
      category: 'cozy',
      ru: 'Сварить кофе или чай со щепоткой корицы для волшебного аромата в доме 🐾',
      uk: 'Зварити каву чи чай із дрібкою кориці для казкового аромату в оселі 🐾',
      en: 'Brew tea or coffee with a pinch of cinnamon to fill the room with warmth 🐾'
    },
    {
      id: 'mq_093',
      category: 'cozy',
      ru: 'Поставить уличную обувь в прихожей ровным и аккуратным рядочком 🐾',
      uk: 'Поставити вуличне взуття в передпокої рівним та охайним рядочком 🐾',
      en: 'Line up outdoor shoes neatly at the doorway 🐾'
    },
    {
      id: 'mq_094',
      category: 'cozy',
      ru: 'Застелить свежее хрустящее постельное бельё и нырнуть в него вечером 🐾',
      uk: 'Застелити свіжу постільну білизну й пірнути в неї ввечері 🐾',
      en: 'Put on fresh, crisp bed sheets and look forward to diving in tonight 🐾'
    },
    {
      id: 'mq_095',
      category: 'cozy',
      ru: 'Выбросить три ненужные старые бумажки или чека из кошелька/кармана 🐾',
      uk: 'Викинути три непотрібні старі папірці або чеки з гаманця/кишені 🐾',
      en: 'Toss out three old receipts or scraps of paper from your wallet 🐾'
    },
    {
      id: 'mq_096',
      category: 'cozy',
      ru: 'Налить свежей прохладной водички домашнему питомцу в чистую мисочку 🐾',
      uk: 'Налити свіжої прохолодної водички домашньому улюбленцю в чисту мисочку 🐾',
      en: 'Pour fresh cool water for your pet into a sparkling clean bowl 🐾'
    },
    {
      id: 'mq_097',
      category: 'cozy',
      ru: 'Повесить на холодильник добрую вдохновляющую записку или памятный магнит 🐾',
      uk: 'Повісити на холодильник добру надихаючу записку або пам’ятний магніт 🐾',
      en: 'Attach a sweet little note or souvenir magnet to the fridge 🐾'
    },
    {
      id: 'mq_098',
      category: 'cozy',
      ru: 'Найти и надеть самые мягкие, тёплые и забавные носочки 🐾',
      uk: 'Знайти й одягнути найм’якші, найтепліші та найкумедніші шкарпетки 🐾',
      en: 'Wear your softest, warmest, and most ridiculous pair of socks 🐾'
    },
    {
      id: 'mq_099',
      category: 'cozy',
      ru: 'Выключить яркий верхний свет и оставить только теплые торшеры или гирлянду 🐾',
      uk: 'Вимкнути яскраве верхнє світло й залишити тільки теплі торшери або гірлянду 🐾',
      en: 'Turn off harsh ceiling lights and relax under cozy string lights or lamps 🐾'
    },
    {
      id: 'mq_100',
      category: 'cozy',
      ru: 'Лечь в кровать, выдохнуть и сказать: «Сегодня был отличный день, Мейни доволен» 🐾',
      uk: 'Лягти в ліжко, видихнути й сказати: «Сьогодні був чудовий день, Мейні задоволений» 🐾',
      en: 'Lie in bed, breathe out, and say: "Today was a good day, Maine is pleased" 🐾'
    }
  ];

  // Universal Export (Browser window or Node environment)
  if (typeof window !== 'undefined') {
    window.MAINE_QUESTS_DATA = MAINE_QUESTS_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAINE_QUESTS_DATA };
  }
})();
