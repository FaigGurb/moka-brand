// Copy of the light "flow" trial page (/flow/). az is the source; en and ru keep the same shape (tests check it).
// `chapters` follows the wordmark order M, O, K, A (the four letters are the four brewing tools).

const az = {
  meta: {
    title: "Xəttə qədər — MOKA Roastery & Eatery",
    description: "MOKA-nın dörd hərfi dörd dəmləmə alətidir. Qəhvə axını hərfdən hərfə keçir və hər birini imza xəttinə qədər doldurur.",
  },
  trial: "Sınaq versiyası",
  nav: { menu: "Menyu", partners: "Tərəfdaşlar", brand: "Brend kitabı", home: "Əsas sayt" },
  hero: {
    eyebrow: "Roastery & Eatery · Bakı",
    title: "Xəttə qədər.",
    text: "MOKA-nın hər hərfi bir dəmləmə alətidir. Aşağı sürüşdürün: qəhvə hərfdən hərfə axır və hər birini imza xəttinə qədər doldurur.",
    scroll: "Sürüşdürün",
  },
  intro: { n: "00", title: "Dəni oyat", text: "Hər şey dəndən başlayır: Bakıda, MOKA-nın öz aparatında qovrulur." },
  chapters: [
    { title: "Moka pot", text: "Ocaqda dəmlənən güclü, sıx qəhvə. M hərfinin çentiyi qazanın qapağıdır." },
    { title: "Fincan", text: "Espresso, Elektra-da. O hərfi yuxarıdan baxılan fincandır." },
    { title: "Chemex", text: "Təmiz, şəffaf damla. K hərfinin qulpu Chemex-in qulpudur." },
    { title: "V60", text: "Konus dripper: dənin dad notlarını ən aydın göstərən üsul." },
  ],
  finale: { title: "4 hərf. 4 dəmləmə. 1 xətt.", text: "Hər fincan düz xəttə qədər doldurulur. Bu xətt bütün brendin imzasıdır." },
  deck: {
    eyebrow: "MOKA-da",
    title: "Qəhvədən o yana",
    cards: [
      { title: "Menyu", text: "İçkilər alətlərin hərfləri ilə" },
      { title: "Tərəfdaşlar", text: "Beş İtaliya brendi, bir bar" },
      { title: "Brend kitabı", text: "Bir xəttin qaydaları" },
      { title: "AR və oyunlar", text: "Kartı skan et, xətti tut" },
    ],
  },
  visit: { eyebrow: "Gəlin", title: "İki MOKA, Bakının mərkəzində", map: "Xəritədə aç" },
};

const en: typeof az = {
  meta: {
    title: "To the line — MOKA Roastery & Eatery",
    description: "MOKA’s four letters are four brewing tools. A stream of coffee runs from letter to letter and fills each one to the signature line.",
  },
  trial: "Trial version",
  nav: { menu: "Menu", partners: "Partners", brand: "Brand book", home: "Main site" },
  hero: {
    eyebrow: "Roastery & Eatery · Baku",
    title: "To the line.",
    text: "Every letter of MOKA is a brewing tool. Scroll down: coffee flows from letter to letter and fills each one to the signature line.",
    scroll: "Scroll",
  },
  intro: { n: "00", title: "Wake the bean", text: "It all starts with the bean: roasted in Baku, on MOKA’s own roaster." },
  chapters: [
    { title: "Moka pot", text: "Strong, dense coffee brewed on the stove. The notch in the M is the pot’s lid." },
    { title: "Cup", text: "Espresso, on the Elektra. The O is a cup seen from above." },
    { title: "Chemex", text: "A clean, clear drip. The handle of the K is the Chemex handle." },
    { title: "V60", text: "The cone dripper: the method that shows a bean’s notes most clearly." },
  ],
  finale: { title: "4 letters. 4 brews. 1 line.", text: "Every cup is filled exactly to the line. That line is the signature of the whole brand." },
  deck: {
    eyebrow: "At MOKA",
    title: "Beyond the cup",
    cards: [
      { title: "Menu", text: "Drinks marked with the tools’ letters" },
      { title: "Partners", text: "Five Italian brands, one bar" },
      { title: "Brand book", text: "The rules of one line" },
      { title: "AR & games", text: "Scan the card, hit the line" },
    ],
  },
  visit: { eyebrow: "Visit", title: "Two MOKAs in central Baku", map: "Open in Maps" },
};

const ru: typeof az = {
  meta: {
    title: "До линии — MOKA Roastery & Eatery",
    description: "Четыре буквы MOKA — четыре инструмента заваривания. Поток кофе переходит от буквы к букве и наполняет каждую до фирменной линии.",
  },
  trial: "Тестовая версия",
  nav: { menu: "Меню", partners: "Партнёры", brand: "Брендбук", home: "Основной сайт" },
  hero: {
    eyebrow: "Roastery & Eatery · Баку",
    title: "До линии.",
    text: "Каждая буква MOKA — инструмент заваривания. Прокрутите вниз: кофе перетекает от буквы к букве и наполняет каждую до фирменной линии.",
    scroll: "Прокрутите",
  },
  intro: { n: "00", title: "Разбуди зерно", text: "Всё начинается с зерна: его обжаривают в Баку, на собственном ростере MOKA." },
  chapters: [
    { title: "Мока", text: "Крепкий, плотный кофе на плите. Вырез в букве M — крышка кофеварки." },
    { title: "Чашка", text: "Эспрессо на Elektra. Буква O — чашка, если смотреть сверху." },
    { title: "Кемекс", text: "Чистая, прозрачная капля. Ручка буквы K — ручка кемекса." },
    { title: "V60", text: "Конусный дриппер: способ, который ярче всего раскрывает ноты зерна." },
  ],
  finale: { title: "4 буквы. 4 способа. 1 линия.", text: "Каждую чашку наполняют ровно до линии. Эта линия — подпись всего бренда." },
  deck: {
    eyebrow: "В MOKA",
    title: "Больше, чем кофе",
    cards: [
      { title: "Меню", text: "Напитки с буквами инструментов" },
      { title: "Партнёры", text: "Пять итальянских брендов, один бар" },
      { title: "Брендбук", text: "Правила одной линии" },
      { title: "AR и игры", text: "Сканируй карту, поймай линию" },
    ],
  },
  visit: { eyebrow: "Приходите", title: "Две MOKA в центре Баку", map: "Открыть на карте" },
};

export const FLOW = { az, en, ru };
