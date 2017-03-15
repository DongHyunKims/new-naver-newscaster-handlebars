/**
 * Created by donghyunkim on 2017. 3. 14..
 */


(function() {
    // ajax 부분
    var jsonDatas;
    var currentSite = 0;

    function runXHR() {
        function reqListener() {
            jsonDatas = JSON.parse(this.responseText);
            loadPage();
            //delegation은 상위 element에 리스너를 걸어주면 하위 자식 노드
            var listUl = document.querySelector(".mainArea>nav>ul");
            listUl.addEventListener("click", listClickHandler);


            var buttonDom = document.querySelector("button");
            buttonDom.addEventListener("click", buttonClickHandler);

            var arrowBtnDom = document.querySelector(".btn");
            arrowBtnDom.addEventListener("click", arrowClickHandler);
        }

        var oReq = new XMLHttpRequest();

        oReq.addEventListener("load", reqListener);


        oReq.open("GET", "./data/newslist.json");
        oReq.send();
    }


    //ajax 실행
    runXHR();



    //페이지 로딩 함수
    function loadPage(state) {
        if(state === 0) currentSite++;
        var listTemplate = '<li class="{name}">{name}</li>';
        var listHtmlResult = "";

        jsonDatas.forEach(function (val) {
            listHtmlResult += listTemplate.replace(/{name}/g, val.title);
        });


        var listDom = document.querySelector(".mainArea>nav>ul");
        //console.log(listDom);
        listDom.innerHTML = listHtmlResult;
        //console.log(jsonData);

        if (jsonDatas.length !== 0) {
            //replaceTemplate(jsonData[0]);
            replacePagingTemplate();
            replaceHandlebarsTemplate(jsonDatas[0]);
        } else {
            var contentDom = document.querySelector(".content");
            contentDom.innerHTML = "";
        }

    }


    //탬플릿을 바꾸어주는 함수
    function replaceTemplate(jsonData) {

        var mainTemplate = document.querySelector("#newsTemplate").innerText;
        //console.log(mainTemplate);
        mainTemplate = mainTemplate.replace("{title}", jsonData.title);
        mainTemplate = mainTemplate.replace("{imgurl}", jsonData.imgurl);
        mainTemplate = mainTemplate.replace("{newsList}", jsonData.newslist.map(function (val) {
            return "<li>" + val + "</li>"
        }).join(""));

        var contentDom = document.querySelector(".content");
        contentDom.innerHTML = mainTemplate;

        var buttonDom = document.querySelector("button");
        buttonDom.addEventListener("click", buttonClickHandler);

        highLight();

    }

    //핸들바를 통해 탬플릿을 바꾸어 주는 함수
    function replaceHandlebarsTemplate(jsonData) {
        var mainTemplate = document.querySelector("#newsTemplate").innerText;
        var template = Handlebars.compile(mainTemplate);

        Handlebars.registerHelper("title",function(){
            return jsonData.title;
        });


        Handlebars.registerHelper("imgurl",function(){
            return jsonData.imgurl;
        });


        Handlebars.registerHelper("newslist",function(){
            return jsonData.newslist;
        });

        mainTemplate = template(jsonData);

        var contentDom = document.querySelector(".content");
        contentDom.innerHTML = mainTemplate;

        var buttonDom = document.querySelector("button");
        buttonDom.addEventListener("click", buttonClickHandler);

        highLight();
    }


    function replacePagingTemplate() {
        var pageTemplate = document.querySelector("#pageTemplate").innerText;
        //console.log(pageTemplate);
        var template = Handlebars.compile(pageTemplate);


        var pagingData = {
            "totalPage" : jsonDatas.length,
            "currentPage" : jsonDatas.length==0 ? jsonDatas.length : currentSite +1
        };


        Handlebars.registerHelper("totalPage",function(){
            return pagingData.totalPage;
        });


        Handlebars.registerHelper("currentPage",function(){
            return pagingData.currentPage;
        });


        pageTemplate = template(pagingData);


        var pagingDom = document.querySelector(".paging");
        pagingDom.innerHTML = pageTemplate;
    }


    //색 강조 함수
    function highLight() {
        var dom = document.querySelectorAll("nav>ul>li");
        dom.forEach(function (value) {
            value.style.color = "black";
        });
        document.querySelector("nav>ul>." + jsonDatas[currentSite].title).style.color = "blue";
    }


    //리스트 클릭 핸들러
    function listClickHandler(event) {
        var seletedData = jsonDatas.filter(function (val, idx) {
            if (val.title == event.target.innerText) {
                currentSite = idx;
                return true;
            }
        })[0];
        replacePagingTemplate();
        replaceHandlebarsTemplate(seletedData);
    }


    //삭제 버튼 클릭 핸들러
    function buttonClickHandler() {
        var titleDom = document.querySelector(".newsName");
        for (var i = 0; i < jsonDatas.length; i++) {
            if (jsonDatas[i].title == titleDom.innerText) {
                jsonDatas.splice(i, 1);
                break;
            }
        }

        currentSite = 0;
        replacePagingTemplate();
        loadPage();
    }

    //화살표 클릭 핸들러
    function arrowClickHandler(event) {

        if (event.target.parentElement.className == "left") {

            if (currentSite > 0) {
                currentSite--;
            } else if (currentSite === 0) {
                currentSite = jsonDatas.length - 1;
            }

        } else {
            if (currentSite < jsonDatas.length - 1) {
                currentSite++;
            } else if (currentSite === jsonDatas.length - 1) {
                currentSite = 0;
            }
        }

        if (jsonDatas.length !== 0) {
            replacePagingTemplate();
            replaceHandlebarsTemplate(jsonDatas[currentSite]);
        }

    }

})();
