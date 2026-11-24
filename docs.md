Tên miền hiện tại: kkphim1.com - kkphim.vip
Tài liệu API mới: https://kkphim1.com/api-document
Tên miền API: https://phimapi.com
Tên miền hình ảnh: https://phimimg.com
Tên miền trình phát: https://player.phimapi.com/player/?url=
Endpoint
/danh-sach/phim-moi-cap-nhat
Phương thức
GET
Mô tả
Danh sách phim mới nhất theo định dạng cổ điển. Có 2 biến thể chi tiết hơn: thêm hậu tố -v2 và -v3 (bổ sung trường và ảnh IMDB/TMDB đầy đủ).

page integer Không Trang hiện tại (mặc định 1).

"status": true,
"items": [
{ "_id": "…", "name": "…", "slug": "…", "origin_name": "…",
"thumb_url": "…", "poster_url": "…", "year": 2024,
"modified": { "time": "…" } }
],
"pathImage": "https://phimapi.com/uploads/movies/",
"pagination": { "totalItems": 100, "totalItemsPerPage": 24,
"currentPage": 1, "totalPages": 5 }

---

Endpoint
/v1/api/home
Phương thức
GET
Mô tả
Đối với API này bạn sẽ được lấy những thông tin phim hiển thị ở trang chủ của KKPhim, bao giờ những phim được cập nhật hôm nay.

---

Endpoint
/v1/api/danh-sach
Phương thức
GET
Mô tả
Danh sách "Phim Mới" thuộc khối Version 1, kèm khối seoOnPage, breadCrumb, params. Không cần slug. Hỗ trợ toàn bộ bộ lọc chung.

---

Phương thức
GET
Mô tả
Lấy phim theo danh sách, đây là API cũ của phiên bản trước đây. type nhận: phim-le, phim-bo, hoat-hinh, tv-shows, phim-chieu-rap.

---

Phương thức
GET
Mô tả
Giống trên nhưng theo định dạng v1 đầy đủ (seoOnPage, breadCrumb, params.pagination) và hỗ trợ mọi tham số ở Bộ lọc & Sắp xếp.

---

Endpoint
/phim/{slug}
Phương thức
GET
Mô tả
Chi tiết một phim theo slug, gồm thông tin phim và danh sách tập (episodes tách ngoài movie).

---

Endpoint
/phim/id/{id}
Phương thức
GET
Mô tả
Như Format 1 nhưng tra cứu theo \_id của phim thay vì slug.

---

Endpoint
/tmdb/{type}/{id}
Phương thức
GET
Mô tả
Tra cứu phim theo mã TheMovieDB. type là movie hoặc tv.

---

Endpoint
/imdb/title/{id}
Phương thức
GET
Mô tả
Tra cứu phim theo ID IMDB.

---

Endpoint
/v1/api/phim/{slug}
Phương thức
GET
Mô tả
Chi tiết phim theo định dạng v1 (Format 2), bọc trong data kèm seoOnPage, breadCrumb, item (chứa cả episodes).

---

Endpoint
/v1/api/phim/{slug}/images
Phương thức
GET
Mô tả
Danh sách hình ảnh (poster, backdrop…) của phim.

---

Endpoint
/v1/api/phim/{slug}/peoples
Phương thức
GET
Mô tả
Danh sách diễn viên, đạo diễn và nhân sự của phim.

---

Endpoint
/v1/api/phim/{slug}/keywords
Phương thức
GET
Mô tả
Danh sách từ khóa (keywords) gắn với phim.

---

Endpoint
/the-loai
Phương thức
GET
Mô tả
Lấy toàn bộ thể loại (tên + slug). Cũng có bản v1: /v1/api/the-loai.

---

Endpoint
/v1/api/the-loai/{slug}
Phương thức
GET
Mô tả
Danh sách phim thuộc một thể loại, hỗ trợ bộ lọc chung.

---

Endpoint
/quoc-gia
Phương thức
GET
Mô tả
Lấy toàn bộ quốc gia (tên + slug). Cũng có bản v1: /v1/api/quoc-gi

---

Endpoint
/v1/api/quoc-gia/{slug}
Phương thức
GET
Mô tả
Danh sách phim thuộc một quốc gia, hỗ trợ bộ lọc chung.

---

Endpoint
/nam-phat-hanh
Phương thức
GET
Mô tả
Lấy danh sách năm phát hành, từ năm hiện tại về 1911 (mới nhất trước).

---

Endpoint
/v1/api/nam/{year}
Phương thức
GET
Mô tả
Danh sách phim theo năm phát hành, hỗ trợ bộ lọc chung.

---

Endpoint
/v1/api/tim-kiem?keyword=[keyword]
Phương thức
GET
Mô tả
Tìm phim theo từ khóa; khớp cả tên tiếng Việt và tên gốc. Hỗ trợ bộ lọc chung và limit.
