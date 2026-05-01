YAZLIKDC.GG SÜRÜM GEÇMİŞİ (PATCH NOTES)

v5.0.0 (Eski V55) - Hasat Zamanı & Ekonomi Devrimi
* Versiyonlama mantığı Semantic Versioning standardına (v5.0.0) çekildi.
* Riot'tan çekilen orman ve koridor minyonları ile "CS/min" hesaplaması getirildi.
* "Vergi Memuru", "Kusursuz Ekonomi" ve "Orman Canavarı" şeklinde yepyeni, profesyonel oyun tarzı algoritmaları eklendi.
* Yeni ekip üyeleri Furkan ve Nurettin sisteme dahil edildi.

v4.9.4 (Eski V54) - Sabotaj Harekâtı
* Bireysel profillerdeki "11+ Ölüm" ifadesi doğrudan kırmızı "SABOTAJ" etiketiyle değiştirilerek acımasız ve dürüst bir formata dönüştürüldü.

v4.9.3 (Eski V52-V53) - Kusursuz Simetri ve Akıllı Navigasyon
* Filtreleme ve arama kutularının sola yaslanma sorunu çözüldü, tüm kutular ekran merkezine (`margin: 0 auto;`) hizalandı.
* Liderlik tablolarındaki ilk 3 sıraya Altın, Gümüş ve Bronz efektli podyum parlamaları getirildi.
* Maçlara veya takımlara tıklandığında ekranın DOM koordinatlarıyla hedef içeriğe akıcı bir şekilde kayması (Dinamik Navigasyon) sağlandı.

v4.9.2 (Eski V51) - Büyük Uyanış
* Destek (Utility) profillerinin yüklenmesi sırasında arayüzü çökerten (`k is not defined`) ortalama skor/asist matematiği hatası tamamen çözüldü.

v4.9.1 (Eski V49-V50) - Kimlik Operasyonu & Nihai Temizlik
* Metinlerin alt satıra düşmesini engelleyen CSS korumaları (`white-space: nowrap`) uygulandı.
* TR sunucusundan taşınan hesapların ve "lilliana" gibi eski isimlerin eşleştirilmesini sağlayan kimlik çözümleyici (Identity Resolver) sisteme entegre edildi.

v4.8.0 (Eski V48) - Saf Kan Ekip & Çelik Zırh
* Fiyatı veya veritabanı kaydı olmayan bozuk eski Riot eşyalarının arayüzü çökerterek "Fatal Error" verdirmesi engellendi.
* Solo maçları engelleyen filtre, sitenin en tepesine taşınarak kesinleştirildi.

v4.7.0 (Eski V47) - Özgür Profiller
* Lejant ve eşya barlarındaki CSS sıkışmaları ile solo maç filtresinin neden olduğu profillerin silinmesi hatası çözüldü.

v4.6.0 (Eski V44-V46) - Yalnız Kurt Silici & Zaman Senkronizasyonu
* Ekip içinden en az 2 kişi olmayan "Yalnız Kurt" (solo) Esnek maçları sistemden çöpe atan "Saf Kan Ekip" filtresi eklendi.
* Maç bilgisindeki tarih ve süre eksikliğini diğer oyunculardan kopyalayarak çözen "Zaman Senkronizasyonu" oluşturuldu.

v4.5.0 (Eski V43) - Okunabilirlik ve Sabit Kadro
* Görseldeki metin boyutları büyütüldü (1.8em).
* Sisteme 15 kişilik kadro kodla sabitlendi, böylece Esnek maç atmayan kişilerin de "Veri bulunamadı" olarak profillerinde yer alması sağlandı.

v4.4.0 (Eski V41-V42) - UI Restorasyonu ve Zaman Damgaları
* HTML profilleri ve çöken tasarımlar restore edildi.
* Zaman ve maç süresi etiketleri profillere yerleştirildi.

v4.3.0 (Eski V38-V40) - Rüya Takımı ve Haftanın Beşlisi
* Maç zamanlarının ve sürelerinin analize katılmasıyla "Haftanın 5'lisi" ve rol bazlı "Tüm Zamanların Rüya Takımı" sekmeleri eklendi.
* Yalnızca Nişancı ve Destek rollerinin baz alındığı Alt Koridor sinerjisi geliştirilerek rüya takım önceliklerine dahil edildi.

v4.2.0 (Eski V36-V37) - Davranış Kalibrasyonu ve Uzmanlık Puanı
* Rol davranışlarındaki görüş/asist hedefleri gerçekçi değerlere kalibre edildi.
* Sinerji Skoru (SP, eflatun) ile Şampiyon Uzmanlık Puanı (UP, magenta) terimleri görsel ve ismen birbirinden ayrıldı.
* Veritabanındaki klon maçları tekillendiren (mükerrer silici) özellik eklendi.

v4.1.0 (Eski V34-V35) - Şampiyon Makyajı ve Alfabetik Sıralama
* Riot API'den dönen hatalı kod isimlerinin (MonkeyKing -> Wukong) arayüzde doğru gözükmesi için makyaj/çeviri sözlüğü eklendi.
* Alfabe sıralamalarının Türkçe'ye uygun yapılması sağlandı.

v4.0.1 (Eski V33) - KDA Eşitlik Bozucu
* Şampiyon uzmanları tablosunda galibiyet oranları eşit olduğunda "KDA" değerinin eşitlik bozucu olarak kullanılması sağlandı.
* Liderlik filtrelerindeki kırılmalar tamir edildi.

v4.0.0 (Eski V31-V32) - Markalaşma ve Çoklu Sinerji Seçimi
* Sitenin HTML başlığı ve logosu "YazlıkDC.GG" olarak markalaştırıldı.
* Takım sinerjisi kısmına çoklu seçim yapılabilen "Filtre Çipleri" ile Netflix tarzı bir filtreleme mantığına geçirildi.

v3.3.1 (Eski V30) - Zaman Çizgisi Yaması
* Kod yamalarından kaynaklı karmaşıklıklar tek dosya halinde birleştirildi.
* ABW geçişi sonrası EUW maçlarının TR maçlarının altında kalmasına neden olan alfabetik hata çözüldü.

v3.3.0 (Eski V28-V29) - Role-Aware AI ve Pervasız Sendromu
* Oyuncuların fazla ölüp az skor çıkardığı maçları tespit eden "Yasuo Sendromu (Pervasız)" filtresi yazıldı.
* Davranış algoritması rollere özel (Destek, Orman, Orta, Üst) hale getirilerek, oyuncuların görevine göre (Örn: Fedakar Koruyucu) analiz edilmesi sağlandı.

v3.2.0 (Eski V27) - Ultimate Player Analytics
* Oyunculara birden fazla oyun tarzı rozeti verilebilmesini sağlayan çoklu-etiket sistemi getirildi.
* Sağ sütuna detaylı "Şampiyon Raporu" paneli eklendi.

v3.1.1 (Eski V26) - Kişisel Filtreler ve UI Şeffaflığı
* Şampiyon uzmanları sekmesindeki SP yazısının alt satıra kayması CSS ile engellendi.
* Bireysel profile "Perfect KDA", "11+ Ölüm" ve şampiyon filtreleme özellikleri eklendi.
* Sinerji hesaplamasındaki Laplace mantığını açıklayan bilgi kutuları oluşturuldu.

v3.1.0 (Eski V25) - Yapay Zeka Sinerjisi ve Rol Esnekliği
* "Bitmiş Eşyalar" yazısı "Favori Eşyalar" olarak düzeltildi ve "3'li" yazım hatası giderildi.
* Sinerji puanına, takımların farklı dizilimlerle oynayabilme başarısını ölçen "Rol Esnekliği" katsayısı eklendi.
* Laplace SP skoru Şampiyon Uzmanları listesine de dahil edildi.

v3.0.0 (Eski V24) - OP.GG Ultimate
* Açılır pencereler (pop-up), profil içi akordeon düzene geçirildi.
* Liderlik filtrelerine kişi bazlı "Tıkla ve Süz" seçeneği getirildi.
* Kariyer başarıları (Perfect KDA, 11+ Ölüm vb.) için ayrı bir kutu tasarlandı.

v2.2.0 (Eski V23) - Gerçek Eşya Filtresi ve Maç Otopsi Ekranı
* Eşya filtresine Riot API entegrasyonu sağlandı ve sadece "bitmiş" eşyalar (1600+ altın ve çizmeler) gösterilmeye başlandı.
* Maçlara tıklandığında tüm takım istatistiklerini OP.GG tarzında açan bir sistem geliştirildi.
* Rekorlarda her zaman "en yeni maçın" öne çıkması sağlandı.

v2.1.0 (Eski V22) - Ultimate Scouting
* Liderlik tablolarındaki hizalama sorunu çözüldü ve bu tablolar tıklanabilir filtre butonlarına dönüştürüldü.
* Oyunculara istatistiklerine göre "Hiper Taşıyıcı", "Vizyoner" gibi otomatik oyun tarzı rozetleri atayan sistem, favori eşyalar paneli ve şampiyon ikonları eklendi.

v2.0.0 (Eski V21) - Veri Bilimi Zekası
* Bireysel liderlik tabloları toplam skorlar yerine "Tek Maç Rekorlarına" göre sıralanmaya başladı.
* Takım sinerjisi kazanma oranlarına, az maç yapanların haksız yükselişini engelleyen "Laplace Yumuşatması (Sinerji Skoru)" algoritması entegre edildi.

v1.2.0 (Eski V20) - Final UX
* En çok ölenler sekmesi "☠️ Utanç Listesi" olarak adlandırıldı.
* Liderlik panosundaki skorların kaç maçta elde edildiğini gösteren ortalama ibareleri eklendi.
* Şampiyon Uzmanları kartları göz yormaması için merkeze toplandı.

v1.1.0 (Eski V18-V19) - Genişletilmiş Lejant ve İkonlar
* Sitedeki ikonların ne anlama geldiğini açıklayan çok kapsayıcı bir "Rozet Bilgisi (Lejant)" çubuğu eklendi.
* Lejanta totem/görüş ikonları da eklendi ve arayüzü sadeleştirmek için başındaki "Lejant:" yazısı silindi.

v1.0.0 (Eski V1-V17) - Temel İnşa Dönemi
* Firebase veritabanı bağlantılarının kurulduğu, HTML taslağının oluşturulduğu ve temel Riot API çekim işlemlerinin test edildiği geliştirme fazlarıdır.

---

PYTHON BOT SÜRÜM GEÇMİŞİ

* v2.1.0 (Eski V12): "429 Too Many Requests" hız sınırlarına takıldığında otomatik beklemeye giren (`get_guvenli`) güvenli istek sistemi (Çelik İrade).
* v2.0.0 (Eski V11): Riot API'den `gameCreation` (Tarih) ve `gameDuration` (Maç Süresi) parametrelerinin toplanmaya başlanması.
* v1.2.0 (Eski V10-V10.1): Botun gereksiz istek atarak kotaları harcamasını önleyen "Firebase Hafızası (Upsert)" mekanizması ve boşluklu isimleri kodlayan (URL Encoding) yapı.
* v1.1.0 (Eski V9): Yalnızca son maçlar yerine eski sezonları kapsayan derin 300 maçlık tarama limitine çıkılması.
* v1.0.0 (Eski V8): Tüm ekip üyelerinin tanımlanarak 5 kişilik maçların 2 kişilik görünmesini çözen çoklu tarama sistemi.
