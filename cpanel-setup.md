# cPanel MySQL Kurulum Rehberi

Bu rehber, FinanceAdd projesini cPanel hosting üzerinde MySQL veritabanı ile çalıştırmak için gerekli adımları açıklar.

## 1. cPanel'de MySQL Veritabanı Oluşturma

### Adım 1: MySQL Veritabanı Oluşturun
1. cPanel'e giriş yapın
2. "MySQL Databases" bölümüne gidin
3. Yeni veritabanı oluşturun (örnek: `financeadd_db`)
4. Veritabanı kullanıcısı oluşturun (örnek: `financeadd_user`)
5. Güçlü bir şifre belirleyin
6. Kullanıcıyı veritabanına ekleyin ve tüm yetkileri verin

### Adım 2: Veritabanı Bilgilerini Kaydedin
```
Veritabanı Adı: your_cpanel_username_financeadd_db
Kullanıcı Adı: your_cpanel_username_financeadd_user
Şifre: [güçlü şifreniz]
Host: localhost
```

## 2. Dosyaları cPanel'e Yükleme

### Adım 1: Projeyi Hazırlayın
1. React projesini build edin: `npm run build`
2. `dist` klasöründeki dosyaları `public_html` klasörüne yükleyin
3. `api` klasörünü `public_html` içine yükleyin

### Adım 2: Veritabanı Yapılandırması
1. `api/config/database.php` dosyasını düzenleyin:

```php
$this->host = 'localhost';
$this->db_name = 'your_cpanel_username_financeadd_db';
$this->username = 'your_cpanel_username_financeadd_user';
$this->password = 'your_strong_password';
```

## 3. Veritabanını Kurma

### Adım 1: phpMyAdmin ile SQL İçe Aktarma
1. cPanel'de phpMyAdmin'e gidin
2. Oluşturduğunuz veritabanını seçin
3. "Import" sekmesine gidin
4. `api/install/database.sql` dosyasını yükleyin ve çalıştırın

### Adım 2: Veritabanı Bağlantısını Test Etme
1. Tarayıcıda `https://yourdomain.com/api/categories/` adresine gidin
2. JSON formatında kategori listesi görmelisiniz

## 4. .htaccess Yapılandırması

`public_html` klasörüne `.htaccess` dosyası ekleyin:

```apache
RewriteEngine On

# React Router için
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# API istekleri için
RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ /api/$1 [L]

# CORS başlıkları
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
```

## 5. PHP Ayarları

cPanel'de PHP sürümünü 7.4 veya üzeri olarak ayarlayın:
1. "Select PHP Version" bölümüne gidin
2. PHP 7.4+ seçin
3. Gerekli extension'ları etkinleştirin:
   - pdo
   - pdo_mysql
   - json
   - curl

## 6. Güvenlik Ayarları

### Veritabanı Güvenliği
1. Güçlü şifreler kullanın
2. Sadece gerekli yetkileri verin
3. Düzenli yedek alın

### Dosya İzinleri
```
api/ klasörü: 755
api/config/ klasörü: 755
api/config/database.php: 644
```

## 7. Test ve Doğrulama

### Frontend Test
1. Ana sayfa yüklenmelidir
2. Kategoriler görüntülenmelidir
3. Makaleler açılmalıdır

### Backend Test
1. `https://yourdomain.com/api/categories/` - Kategoriler
2. `https://yourdomain.com/api/articles/` - Makaleler
3. `https://yourdomain.com/api/settings/` - Ayarlar

### Admin Panel Test
1. `/admin` adresine gidin
2. Giriş yapın (admin/admin123)
3. Veritabanı işlemlerini test edin

## 8. Sorun Giderme

### Yaygın Hatalar

**"Database connection failed"**
- Veritabanı bilgilerini kontrol edin
- MySQL servisinin çalıştığından emin olun

**"404 Not Found" API isteklerinde**
- .htaccess dosyasını kontrol edin
- mod_rewrite etkin mi kontrol edin

**"CORS Error"**
- .htaccess'te CORS başlıklarını kontrol edin
- PHP'de header() fonksiyonlarını kontrol edin

### Log Dosyaları
- cPanel Error Logs bölümünden hataları kontrol edin
- PHP error_log dosyasını inceleyin

## 9. Performans Optimizasyonu

### Veritabanı
- Gerekli indekslerin olduğundan emin olun
- Büyük tablolar için sayfalama kullanın

### Önbellekleme
- Browser cache başlıkları ekleyin
- Static dosyalar için uzun cache süreleri ayarlayın

### Güvenlik
- SQL injection koruması (PDO kullanılıyor)
- XSS koruması
- CSRF koruması

## 10. Bakım ve Güncelleme

### Düzenli Görevler
- Veritabanı yedekleri
- Log dosyalarını temizleme
- Güvenlik güncellemeleri

### Monitoring
- Site uptime kontrolü
- Veritabanı performans izleme
- Error log takibi

Bu kurulum tamamlandığında, FinanceAdd projesi cPanel hosting üzerinde MySQL veritabanı ile tam olarak çalışacaktır.