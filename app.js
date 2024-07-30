// 하단 디테일 박스 숨김 및 보임 기능
const detailGuide = document.querySelector('.guide');
const guideIcon = document.querySelector('.guide i');
const detailBox = document.querySelector('.detail_box');
const detailHeight = detailBox.offsetHeight;

detailBox.style.bottom = -detailHeight + 'px';
// detailBox.style.bottom = 0;

detailGuide.addEventListener('click', function () {
  this.classList.toggle('active');

  if (this.classList.contains('active')) {
    guideIcon.setAttribute('class', 'ri-arrow-drop-down-line');
    detailBox.style.bottom = 0;
  } else {
    guideIcon.setAttribute('class', 'ri-arrow-drop-up-line');
    detailBox.style.bottom = -detailHeight + 'px';
  }
});


// 지도 기능 구현
let map = new naver.maps.Map('map', {});

// api 로부터 필요한 데이터만 추출
// console.log(data);
const currentData = data.records.filter((item) => 
{ return (
    item.데이터기준일자.split('-')[0] >= '2023' &&
    item.데이터기준일자.split('-')[1] >= '10' && 
    item.위도 !== ''
); }
);
// console.log(currentData);

// 검색 버튼 기능
const searchBtn = document.querySelector('.search button');
const searchInput = document.querySelector('.search input');
const mapElmt = document.querySelector('#map'); // 네이버 맵 영역
const loading = document.querySelector('.loading'); // 로딩 이미지

// 검색 버튼 클릭 시 실행함수
searchBtn.addEventListener("click", () => {
    const searchValue = searchInput.value; // 입력값 저장

    if(searchInput.value === '') {
        alert('검색어를 입력해 주세요.');
        searchInput.focus(); // 커서 입력창에 포커스,
        return;
    }

    const searchResult = currentData.filter((item) => item.도서관명.includes(searchValue) || item.시군구명.includes(searchValue));

    if (searchResult.length === 0) {
        alert('검색 결과가 없습니다.');
        searchInput.value = ''; // 검색어 지움
        searchInput.focus(); // 커서 입력창에 포커스

        return;
    } else {
        mapElmt.innerHTML = ''; // 네이버 맵 영역 초기화
        startLenderMap(searchResult[0].위도, searchResult[0].경도);
    }
})


// 네이버 맵에 마크 생성
navigator.geolocation.getCurrentPosition((position) => {
// console.log(position)
const lat = position.coords.latitude;
const lng = position.coords.longitude;

startLenderMap(lat, lng);
});

function startLenderMap(lat, lng) {
    mapElmt.innerHTML = ''; // 네이버 맵 영역 초기화

    map = new naver.maps.Map('map', {
        center: new naver.maps.LatLng(lat, lng),
        zoom: 13
    });

    // var marker = new naver.maps.Marker({
    //     position: new naver.maps.LatLng(lat, lng),
    //     map: map,

    // });

    currentData.forEach((item) => {
        let latlng = new naver.maps.LatLng(item.위도, item.경도);
        let bounds = map.getBounds();

        if(bounds.hasLatLng(latlng)) { // 현재 위치를 기준으로 화면 사이에 있는지 확인
            var marker = new naver.maps.Marker({
                position: latlng,
                map: map,

                title: item.도서관명,
                itemCount: item['자료수(도서)'],
                serialItemCount: item['자료수(연속간행물)'],
                notBookItemCount: item['자료수(비도서)'],
                sitCount: item.열람좌석수,
                wdStart: item.평일운영시작시각,
                wdEnd: item.평일운영종료시각,
                wkStart: item.토요일운영시작시각,
                wkEnd: item.토요일운영종료시각,
                contact: item.도서관전화번호,
                address: item.소재지도로명주소,
                homePage: item.홈페이지주소,
            });
            // console.log(marker.title);
            let infoWindow = new naver.maps.InfoWindow({
                content: `
                    <h4 style="padding:0.25rem 0.5rem; font-size:12px; font-weight:400; color:#555">${item.도서관명}</h4>
                `,
            });

            setTimeout(()=> {
                loading.style.display = 'none';
            }, 800)
            // loading.style.display = 'none';

            naver.maps.Event.addListener(marker, 'click', function() {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }

                const markerInfoData = {
                    title: marker.title,
                    itemCount: marker.itemCount,
                    serialItemCount: marker.serialItemCount,
                    notBookItemCount: marker.notBookItemCount,
                    sitCount: marker.sitCount,
                    wdStart: marker.wdStart,
                    wdEnd: marker.wdEnd,
                    wkStart: marker.wkStart,
                    wkEnd: marker.wkEnd,
                    contact: marker.contact,
                    address: marker.address,
                    homePage: marker.homePage,
                };

                getInfoOnMarker(markerInfoData);
            });
        }
        });

        function getInfoOnMarker(markerInfoData) {
            // console.log(markerInfoData);

            const infoWrapper = document.querySelector('.detail_wrapper');
            detailBox.style.bottom = 0;
            detailGuide.classList.add('active');
            guideIcon.setAttribute('class', 'ri-arrow-drop-down-line');
            infoWrapper.innerHTML = '';

            const { title, itemCount, serialItemCount, notBookItemCount, sitCount, wdStart, wdEnd, wkStart, wkEnd, contact, address, homePage, } = markerInfoData;
            
            const infoElmt = `
            <div class="detail_title">
                <h2>${title}</h2>
            </div>
            <div class="detail_info">
                <div class="info_1">
                    <h3>자료수(도서)</h3>
                    <h3>${itemCount}</h3>
                </div>
                <div class="info_2">
                    <h3>자료수(연속간행물)</h3>
                    <h3>${serialItemCount}</h3>
                </div>
                <div class="info_3">
                    <h3>자료수(비도서)</h3>
                    <h3>${notBookItemCount}</h3>
                </div>
                <div class="info_4">
                    <h3>열람좌석수</h3>
                    <h3>${sitCount}</h3>
                </div>
            </div>
            <div class="detail_text">
                <div class="time">
                    <div class="time_title">운영시간</div>
                    <div class="time_contents">
                        <p class="week_day">${wdStart} ~ ${wdEnd}(평일)</p>
                        <p class="week_end">${wkStart} ~ ${wkEnd}(주말)</p>
                        <p class="holly_day">공휴일 휴관</p>
                    </div>
                </div>
                <div class="tell">
                    <div class="tell_title">연락처</div>
                    <div class="tell_contents">
                        <p>${contact}</p>
                    </div>
                </div>
                <div class="addr">
                    <div class="addr_title">주소</div>
                    <div class="addr_contents">
                        <p>${address}</p>
                    </div>
                </div>
                <div class="homepage">
                    <div class="homepage_title">홈페이지</div>
                    <div class="homepage_contents">
                        <p><a href="${homePage}">${homePage}</a></p>
                    </div>
                </div>
            </div>
            `

            infoWrapper.insertAdjacentHTML('beforeend', infoElmt);
        }
}
 


//
// toBtn 버튼에 한번에 clickEvent 기능을 부여하고 싶음..
//

// <div class="toBtn">
// <div class="toBusan"><span><i class="ri-compass-2-fill"></i>to부산</span></div>

// class="toBtn" 를 가져와서, 안에 들어 있는 div 태그들을 돌며 class Name 을 배열에 저장.
// -> [ toBusan, toSeoul, ... ]
// 그러면 아래 부분은 변수로 통합 가능함.
// let toButton = document.querySelector('$.{toBtn[i]}');

// 지역 위도 경도를 저장하려면...
// 

let busanLatLng = new naver.maps.LatLng(35.1797865, 129.0750194); // 부산 위도 경도
let seoulLatLng = new naver.maps.LatLng(37.4734848, 126.8776964); // 서울 위도 경도
let toBusanBtn = document.querySelector('.toBusan');
let toSeoulBtn = document.querySelector('.toSeoul');
let toNowBtn = document.querySelector('.toNow');


toBusanBtn.addEventListener("click", (e) => {
    e.preventDefault();

    startLenderMap(busanLatLng._lat, busanLatLng._lng);

})

toSeoulBtn.addEventListener("click", (e) => {
    e.preventDefault();

    startLenderMap(seoulLatLng._lat, seoulLatLng._lng);
})


toNowBtn.addEventListener("click", (e) => {
    e.preventDefault();

    let nowLatLng = new naver.maps.LatLng(map.getCenter()._lat, map.getCenter()._lng); // 현재 위도 경도

    startLenderMap(nowLatLng._lat, nowLatLng._lng);
})

