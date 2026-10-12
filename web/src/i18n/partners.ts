// Copy of the partners page (/partners/). az is the source; en and ru keep the same shape (tests check it).
// Facts come from the partners' official sites and from MOKA (bar models, October 2026). Anything MOKA has
// not confirmed (service terms, price lists) is not stated: the page sends visitors to MOKA instead.
// `brands` follows the order of PARTNERS in lib/site.ts.

const az = {
  meta: {
    title: "Tərəfdaşlar — MOKA Roastery & Eatery",
    description: "MOKA Azərbaycanda Pitti Caffè, Mazzer, Elektra, ODK və ISA brendlərinin rəsmi distribyutorudur. Hər brend haqqında, MOKA-nın barında işləyən modellər və əlaqə.",
  },
  hero: {
    eyebrow: "Rəsmi distribyutor · İtaliyadan Bakıya",
    title: "Beş İtaliya brendi. Bir bar.",
    text: "MOKA bu brendləri Azərbaycana gətirir və hər gün öz barında işlədir. Ona görə də onlar haqqında kataloqdan yox, təcrübədən danışırıq: qəhvədən vitrinə qədər bir fincanın yolu.",
    jump: "Brendlər",
  },
  labels: { origin: "Haradan", range: "Nə təklif edir", bar: "MOKA-nın barında", site: "Rəsmi sayt", ask: "Bu brend üzrə sorğu" },
  brands: [
    {
      step: "Qəhvə",
      tagline: "Espresso üçün İtaliya qəhvəsi",
      about: "Pitti Caffè Milanın yanında, Corsico-da Moka Efti şirkətinin qəhvə brendidir. Xəttində espresso üçün dən və üyüdülmüş qəhvə qarışıqları var.",
      origin: "Corsico, Milan · İtaliya",
      range: "Dən və üyüdülmüş qəhvə qarışıqları",
      bar: ["Pitti Caffè espresso, MOKA-nın öz qovurması ilə yanaşı"],
    },
    {
      step: "Üyütmə",
      tagline: "Dəqiq üyütmə, sabit dad",
      about: "Mazzer Venesiya yaxınlığında, Scorzè-də peşəkar qəhvə dəyirmanları istehsal edir. Espresso və filtr üçün modelləri dünyanın bir çox qəhvəxanasında işləyir.",
      origin: "Scorzè, Venesiya · İtaliya",
      range: "Espresso və filtr üçün peşəkar dəyirmanlar",
      bar: ["Robur S: yüksək axın üçün konusvari daşlı dəyirman", "ZM Plus: espresso və filtr üçün tək dozalı dəyirman"],
    },
    {
      step: "Espresso",
      tagline: "1947-dən bəri espresso maşınları",
      about: "Elektra 1947-ci ildən Trevizoda espresso maşınları hazırlayır. Klassik dizaynı ilə tanınan brend həm kafe, həm də ev üçün maşınlar istehsal edir. MOKA-nın “Elektra ruhu, Moka dadı” şüarı da buradan gəlir.",
      origin: "Trevizo · İtaliya",
      range: "Peşəkar və ev üçün espresso maşınları",
      bar: ["Elektra Indie: çox qazanlı peşəkar espresso maşını"],
    },
    {
      step: "Sirop",
      tagline: "Latte və kokteyllər üçün dad",
      about: "ODK 1992-dən bəri Orsadrinks şirkətinin brendidir. Bar və qəhvəxanalar üçün siroplar, meyvə püreləri və kokteyl miksləri hazırlayır.",
      origin: "Marene · İtaliya",
      range: "Siroplar, meyvə püreləri, kokteyl miksləri",
      bar: ["MOKA-nın postlarında görünən dadlar: Speculoos, Gingerbread, Choco Cookie, Tonka Bean, Coconut, Guava"],
    },
    {
      step: "Vitrin",
      tagline: "Soyuq saxlama, gözəl təqdimat",
      about: "ISA 1963-dən bəri Umbriyada soyuducu vitrinlər istehsal edir: desert, dondurma və bar məhsullarını həm saxlamaq, həm də göstərmək üçün.",
      origin: "Umbriya · İtaliya",
      range: "Soyuducu vitrinlər və bar avadanlığı",
      bar: ["Desert vitrini və soyuducular"],
    },
  ],
  b2b: {
    eyebrow: "Biznesiniz üçün",
    title: "Kafe, restoran, otel və ya ofis açırsınız?",
    text: "Avadanlıq, qəhvə və bar məhsulları üçün MOKA ilə birbaşa əlaqə saxlayın. Modellər, qiymətlər, quraşdırma və servis şərtlərini telefonla dəqiqləşdirmək olar.",
    instagram: "Instagram-da yaz",
  },
  note: "Brend adları, loqolar və saytlar sahiblərinə məxsusdur. Loqolar müvəqqətidir: MOKA rəsmi faylları göndərəndə əvəz olunacaq.",
  back: "Ana səhifə",
};

const en: typeof az = {
  meta: {
    title: "Partners — MOKA Roastery & Eatery",
    description: "MOKA is the official distributor of Pitti Caffè, Mazzer, Elektra, ODK and ISA in Azerbaijan. About each brand, the models in MOKA's own bar, and contacts.",
  },
  hero: {
    eyebrow: "Official distributor · From Italy to Baku",
    title: "Five Italian brands. One bar.",
    text: "MOKA brings these brands to Azerbaijan and works with them every day in its own bar. So we talk about them from experience, not from a catalogue: the path of a cup, from coffee to showcase.",
    jump: "Brands",
  },
  labels: { origin: "From", range: "What it offers", bar: "In MOKA’s bar", site: "Official site", ask: "Ask about this brand" },
  brands: [
    {
      step: "Coffee",
      tagline: "Italian coffee for espresso",
      about: "Pitti Caffè is the coffee brand of Moka Efti in Corsico, near Milan. Its range includes bean and ground coffee blends for espresso.",
      origin: "Corsico, Milan · Italy",
      range: "Bean and ground coffee blends",
      bar: ["Pitti Caffè espresso, alongside MOKA’s own roasts"],
    },
    {
      step: "Grinding",
      tagline: "Precise grinding, steady taste",
      about: "Mazzer makes professional coffee grinders in Scorzè, near Venice. Its espresso and filter models work in coffee bars around the world.",
      origin: "Scorzè, Venice · Italy",
      range: "Professional grinders for espresso and filter",
      bar: ["Robur S: conical-burr grinder for high volume", "ZM Plus: single-dose grinder for espresso and filter"],
    },
    {
      step: "Espresso",
      tagline: "Espresso machines since 1947",
      about: "Elektra has been making espresso machines in Treviso since 1947. Known for its classic design, the brand builds machines for cafés and for the home. MOKA’s line “Elektra spirit, Moka taste” comes from here.",
      origin: "Treviso · Italy",
      range: "Professional and home espresso machines",
      bar: ["Elektra Indie: multi-boiler professional espresso machine"],
    },
    {
      step: "Syrup",
      tagline: "Flavour for lattes and cocktails",
      about: "ODK has been an Orsadrinks brand since 1992. It makes syrups, fruit purées and cocktail mixes for bars and coffee shops.",
      origin: "Marene · Italy",
      range: "Syrups, fruit purées, cocktail mixes",
      bar: ["Flavours seen in MOKA’s posts: Speculoos, Gingerbread, Choco Cookie, Tonka Bean, Coconut, Guava"],
    },
    {
      step: "Showcase",
      tagline: "Cold storage, good presentation",
      about: "ISA has been making refrigerated showcases in Umbria since 1963: to keep and display desserts, gelato and bar products.",
      origin: "Umbria · Italy",
      range: "Refrigerated showcases and bar equipment",
      bar: ["Dessert showcase and fridges"],
    },
  ],
  b2b: {
    eyebrow: "For your business",
    title: "Opening a café, restaurant, hotel or office?",
    text: "For equipment, coffee and bar products, contact MOKA directly. Models, prices, installation and service terms can be confirmed by phone.",
    instagram: "Message on Instagram",
  },
  note: "Brand names, logos and websites belong to their owners. The logos are temporary and will be replaced with MOKA’s official files.",
  back: "Home",
};

const ru: typeof az = {
  meta: {
    title: "Партнёры — MOKA Roastery & Eatery",
    description: "MOKA — официальный дистрибьютор Pitti Caffè, Mazzer, Elektra, ODK и ISA в Азербайджане. О каждом бренде, модели в баре MOKA и контакты.",
  },
  hero: {
    eyebrow: "Официальный дистрибьютор · Из Италии в Баку",
    title: "Пять итальянских брендов. Один бар.",
    text: "MOKA привозит эти бренды в Азербайджан и каждый день работает с ними в собственном баре. Поэтому мы говорим о них по опыту, а не по каталогу: путь чашки от кофе до витрины.",
    jump: "Бренды",
  },
  labels: { origin: "Откуда", range: "Что предлагает", bar: "В баре MOKA", site: "Официальный сайт", ask: "Запрос по бренду" },
  brands: [
    {
      step: "Кофе",
      tagline: "Итальянский кофе для эспрессо",
      about: "Pitti Caffè — кофейный бренд компании Moka Efti из Корсико под Миланом. В линейке — смеси зернового и молотого кофе для эспрессо.",
      origin: "Корсико, Милан · Италия",
      range: "Смеси зернового и молотого кофе",
      bar: ["Эспрессо Pitti Caffè рядом с собственной обжаркой MOKA"],
    },
    {
      step: "Помол",
      tagline: "Точный помол, стабильный вкус",
      about: "Mazzer производит профессиональные кофемолки в Скорце под Венецией. Её модели для эспрессо и фильтра работают в кофейнях по всему миру.",
      origin: "Скорце, Венеция · Италия",
      range: "Профессиональные кофемолки для эспрессо и фильтра",
      bar: ["Robur S: коническая кофемолка для большого потока", "ZM Plus: кофемолка для дозирования под одну порцию, эспрессо и фильтр"],
    },
    {
      step: "Эспрессо",
      tagline: "Эспрессо-машины с 1947 года",
      about: "Elektra делает эспрессо-машины в Тревизо с 1947 года. Бренд, известный классическим дизайном, выпускает машины для кофеен и для дома. Слоган MOKA «Дух Elektra, вкус Moka» — отсюда.",
      origin: "Тревизо · Италия",
      range: "Профессиональные и домашние эспрессо-машины",
      bar: ["Elektra Indie: профессиональная мультибойлерная эспрессо-машина"],
    },
    {
      step: "Сироп",
      tagline: "Вкус для латте и коктейлей",
      about: "ODK — бренд компании Orsadrinks с 1992 года. Делает сиропы, фруктовые пюре и коктейльные миксы для баров и кофеен.",
      origin: "Марене · Италия",
      range: "Сиропы, фруктовые пюре, коктейльные миксы",
      bar: ["Вкусы из постов MOKA: Speculoos, Gingerbread, Choco Cookie, Tonka Bean, Coconut, Guava"],
    },
    {
      step: "Витрина",
      tagline: "Холод и красивая подача",
      about: "ISA производит холодильные витрины в Умбрии с 1963 года: чтобы хранить и показывать десерты, джелато и барные продукты.",
      origin: "Умбрия · Италия",
      range: "Холодильные витрины и барное оборудование",
      bar: ["Витрина для десертов и холодильники"],
    },
  ],
  b2b: {
    eyebrow: "Для бизнеса",
    title: "Открываете кофейню, ресторан, отель или офис?",
    text: "По оборудованию, кофе и барным продуктам обращайтесь в MOKA напрямую. Модели, цены, установку и условия сервиса можно уточнить по телефону.",
    instagram: "Написать в Instagram",
  },
  note: "Названия брендов, логотипы и сайты принадлежат их владельцам. Логотипы временные и будут заменены официальными файлами от MOKA.",
  back: "Главная",
};

export const PARTNER_PAGE = { az, en, ru };
