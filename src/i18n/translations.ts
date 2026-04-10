export type Locale = 'uk' | 'ru'

const uk = {
  'doc.title': 'YTRomaX — Minecraft сервер',

  'logo.aria': 'YTRomaX — на початок',

  'nav.aria': 'Головна навігація',
  'nav.shop': 'Магазин',
  'nav.forum': 'Форум',
  'nav.help': 'Допомога',

  'lang.aria': 'Мова інтерфейсу',
  'lang.uk': 'Укр',
  'lang.ru': 'Рус',

  'hero.title1': 'Найкращий',
  'hero.title2': 'Minecraft-проєкт',
  'hero.lead':
    'Заходь на сервер, дивись стріми та гайди на YouTube — все в одному ком’юніті YTRomaX.',
  'hero.online': 'гравців онлайн',
  'hero.cardTags': 'PvP · Виживання · Івенти',
  'hero.copied': 'Скопійовано в буфер',
  'hero.copyAria.copied': 'IP скопійовано',
  'hero.copyAria.copy': 'Копіювати IP',

  'shop.title1': 'Магазин ',
  'shop.title2': 'привілеїв',
  'shop.products': 'Товари',
  'shop.kits': 'Набори',
  'shop.deal': 'Вигідно',
  'shop.allProducts': 'Усі товари',
  'shop.empty1':
    'Оформлення покупок підключіть до свого магазину (EasyDonate, тощо)',
  'shop.empty2':
    'Натисніть товар зліва після інтеграції — тут з’являться деталі та оплата.',
  'rank.from': 'від',

  'recent.title1': 'Останні ',
  'recent.title2': 'покупки',
  'recent.i1': 'IRON — Назавжди',
  'recent.i2': 'Золото — 100',
  'recent.i3': 'DELUXE — 30 дн.',
  'recent.i4': 'MASTER — Назавжди',
  'recent.i5': 'IRON — 7 дн.',

  'rules.title': 'Правила сервера',
  'rules.r1': 'Поважай гравців — без образ і доксингу.',
  'rules.r2': 'Чіти та x-ray заборонені.',
  'rules.r3': 'Гріф дозволений лише там, де про це явно сказано.',
  'rules.r4': 'За порушення — бан за рішенням модерації.',

  'world.title': 'Світ та режими',
  'world.p1':
    'Виживання, економіка, клани та івенти. Новини та анонси — у Telegram та на YouTube каналі YTRomaX.',
  'world.p2.before': 'Зміни IP сервера в коді: константа ',
  'world.p2.after': ' у файлі ',

  'forum.title': 'Форум',
  'forum.p':
    'Офіційний форум можна винести на окремий сайт або використати Discord / гілки в Telegram. Додай сюди посилання, коли буде готово.',

  'howto.title': 'Як зайти',
  'howto.1': 'Відкрий Minecraft Java Edition.',
  'howto.2': 'Багатокористувацька гра → Додати сервер.',
  'howto.3': 'Скопіюй IP кнопкою в блоці вище.',
  'howto.4': 'Готово — заходь у гру.',

  'contacts.title': 'Контакти',
  'contact.telegramDm': 'Telegram (DM)',
  'contact.telegramCh': 'Telegram канал',

  'footer.1': 'Не пов’язано з Mojang Studios або Microsoft.',
  'footer.2': 'YTRomaX © {year} · Minecraft сервер та медіа',
} as const

const ru: Record<keyof typeof uk, string> = {
  'doc.title': 'YTRomaX — Minecraft сервер',

  'logo.aria': 'YTRomaX — в начало',

  'nav.aria': 'Главная навигация',
  'nav.shop': 'Магазин',
  'nav.forum': 'Форум',
  'nav.help': 'Помощь',

  'lang.aria': 'Язык интерфейса',
  'lang.uk': 'Укр',
  'lang.ru': 'Рус',

  'hero.title1': 'Лучший',
  'hero.title2': 'Minecraft-проект',
  'hero.lead':
    'Заходи на сервер, смотри стримы и гайды на YouTube — всё в одном сообществе YTRomaX.',
  'hero.online': 'игроков онлайн',
  'hero.cardTags': 'PvP · Выживание · Ивенты',
  'hero.copied': 'Скопировано в буфер',
  'hero.copyAria.copied': 'IP скопирован',
  'hero.copyAria.copy': 'Скопировать IP',

  'shop.title1': 'Магазин ',
  'shop.title2': 'привилегий',
  'shop.products': 'Товары',
  'shop.kits': 'Наборы',
  'shop.deal': 'Выгодно',
  'shop.allProducts': 'Все товары',
  'shop.empty1':
    'Подключите оформление покупок к своему магазину (EasyDonate и т. п.)',
  'shop.empty2':
    'После интеграции нажмите товар слева — здесь появятся детали и оплата.',

  'rank.from': 'от',

  'recent.title1': 'Последние ',
  'recent.title2': 'покупки',
  'recent.i1': 'IRON — Навсегда',
  'recent.i2': 'Золото — 100',
  'recent.i3': 'DELUXE — 30 дн.',
  'recent.i4': 'MASTER — Навсегда',
  'recent.i5': 'IRON — 7 дн.',

  'rules.title': 'Правила сервера',
  'rules.r1': 'Уважай игроков — без оскорблений и доксинга.',
  'rules.r2': 'Читы и x-ray запрещены.',
  'rules.r3': 'Гриф разрешён только там, где это явно сказано.',
  'rules.r4': 'За нарушения — бан по решению модерации.',

  'world.title': 'Мир и режимы',
  'world.p1':
    'Выживание, экономика, кланы и ивенты. Новости и анонсы — в Telegram и на YouTube-канале YTRomaX.',
  'world.p2.before': 'Смените IP сервера в коде: константа ',
  'world.p2.after': ' в файле ',

  'forum.title': 'Форум',
  'forum.p':
    'Официальный форум можно вынести на отдельный сайт или использовать Discord / ветки в Telegram. Добавьте сюда ссылку, когда будет готово.',

  'howto.title': 'Как зайти',
  'howto.1': 'Открой Minecraft Java Edition.',
  'howto.2': 'Сетевая игра → Добавить сервер.',
  'howto.3': 'Скопируй IP кнопкой в блоке выше.',
  'howto.4': 'Готово — заходи в игру.',

  'contacts.title': 'Контакты',
  'contact.telegramDm': 'Telegram (ЛС)',
  'contact.telegramCh': 'Telegram канал',

  'footer.1': 'Не связано с Mojang Studios или Microsoft.',
  'footer.2': 'YTRomaX © {year} · Minecraft сервер и медиа',
}

export type MessageKey = keyof typeof uk

export const translations: Record<Locale, Record<MessageKey, string>> = {
  uk: uk as unknown as Record<MessageKey, string>,
  ru,
}
