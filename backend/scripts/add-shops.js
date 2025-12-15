// Добавление магазинов в справочник

const pool = require('../db');

const shops = [
    { name: 'Леруа', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Петрович', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Центр комплектации саун', phone: '89219125903', address: 'Курляндская 44', working_hours: 'ПН-ПТ 10:00-19:00', contact_person: null, website: null },
    { name: 'Окна Сергей', phone: '89601183024', address: null, working_hours: null, contact_person: 'Сергей', website: null },
    { name: 'Утеплитель/плёнки', phone: '89119974312', address: null, working_hours: null, contact_person: 'Ренат', website: null },
    { name: 'Стройсервис', phone: '89111251220', address: null, working_hours: null, contact_person: 'Сергей', website: null },
    { name: 'Озон', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Вимос', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Тележка', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'СтройУдача', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Beltermo', phone: '89600482475, 99655978016, 88006004780', address: 'Колпинское шоссе 135, строение 1. Логопарк Шушары', working_hours: 'Ежедневно : с 9:00 до 18:00', contact_person: 'Алексей 89033882791', website: 'https://beltermo.su/thankyou' },
    { name: 'Финострой', phone: '8(812) 408 11 07', address: 'Выборгское шоссе 212', working_hours: null, contact_person: null, website: 'https://finstroy.spb.ru/vetrozashchitnaya-plita-beltermo/?srsltid=AfmBOorDFoCVam-q3GDOyxNG68GRExKuhVeFuowZkvmJny9ukCy8ULa8' },
    { name: 'Финострой (Ленинский)', phone: '8(812) 408 46 19', address: 'Ленинский пр. д. 140', working_hours: null, contact_person: null, website: null },
    { name: 'Финострой (Курская)', phone: '8(812) 408 32 90', address: 'ул. Курская, д. 21', working_hours: null, contact_person: null, website: null },
    { name: 'Экопланета', phone: '89219543063', address: 'ЛО, г. Тельмана, Красноборская дорога 4к4', working_hours: 'Ежедневно 9:00-19:00', contact_person: null, website: 'https://www.ekoplaneta.su/catalog/teploizolyatsiya/drevesnye_plity_beltermo/' },
    { name: 'ТопХаус', phone: '8(812) 244-95-40', address: null, working_hours: null, contact_person: null, website: 'https://www.tophouse.ru/products/utepliteli/obreshetka/beltermo/?srsltid=AfmBOoq-sA4aw1R3A1iARNs2z-zVeeXtFtp01ymiyDG1jxce5XRwvjNj' },
    { name: 'Цитадель крепежа', phone: '89319704732', address: 'Домостроительная 3д', working_hours: 'Пн-Пт с 8:30 до 17:30, суббота с 10:00 до 16:00', contact_person: null, website: null },
    { name: 'Марго', phone: '89811412131', address: null, working_hours: null, contact_person: null, website: null },
    { name: 'ГК МИР ТЕПЛОИЗОЛЯЦИИ', phone: '89119974312', address: 'г Санкт-Петербург ул Мурзинская, д. 11А, оф 706-1', working_hours: null, contact_person: 'Сергей', website: null },
    { name: 'Пневмо-Альянс', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Егор Кабеля', phone: '89633141230', address: null, working_hours: null, contact_person: 'Егор', website: null },
    { name: 'Гнет металл', phone: '89216498895', address: 'Софийская 58, гараж 1134вроде, заехать под левый шлагбаум и двигаться по правую руку до конца стоянок. Будет двухэтажный гараж', working_hours: 'ПН-ПТ 10:00-19:00 сб 10:00-17:00', contact_person: 'Евгений', website: null },
    { name: 'Окна Форте', phone: '89311035043', address: 'Санкт-Петербург, ул. Глиняная, д. 19/1, лит. А', working_hours: '10:00-19:00', contact_person: 'Юлия', website: 'www.okna-forte.ru' },
    { name: 'Лукойл', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Лента', phone: null, address: null, working_hours: null, contact_person: null, website: null },
    { name: 'Делимобиль', phone: null, address: null, working_hours: null, contact_person: null, website: null }
];

async function addShops() {
    try {
        console.log('🏪 Добавляю магазины в справочник...\n');

        let added = 0;
        let skipped = 0;

        for (const shop of shops) {
            try {
                const result = await pool.query(
                    `INSERT INTO taiga.shops (name, phone, address, working_hours, contact_person, website)
                     VALUES ($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (name) DO UPDATE SET
                         phone = COALESCE(EXCLUDED.phone, shops.phone),
                         address = COALESCE(EXCLUDED.address, shops.address),
                         working_hours = COALESCE(EXCLUDED.working_hours, shops.working_hours),
                         contact_person = COALESCE(EXCLUDED.contact_person, shops.contact_person),
                         website = COALESCE(EXCLUDED.website, shops.website)
                     RETURNING id, name`,
                    [shop.name, shop.phone || null, shop.address || null, shop.working_hours || null, shop.contact_person || null, shop.website || null]
                );
                
                if (result.rows[0]) {
                    console.log(`✅ ${shop.name}`);
                    added++;
                }
            } catch (error) {
                if (error.code === '23505') { // Unique violation
                    console.log(`⏭️  ${shop.name} (уже существует)`);
                    skipped++;
                } else {
                    console.error(`❌ Ошибка при добавлении ${shop.name}:`, error.message);
                }
            }
        }

        console.log(`\n✅ Готово! Добавлено: ${added}, Пропущено: ${skipped}`);

    } catch (error) {
        console.error('❌ Ошибка:', error.message);
        console.error(error);
    } finally {
        await pool.end();
    }
}

addShops();





