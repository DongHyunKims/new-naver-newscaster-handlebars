/**
 * Created by donghyunkim on 2017. 3. 14..
 */

/*
    dom을 객체에 넣고 쉽게 사용한다
    insertAdjacentHTML() 함수 찾아보기
    페이지 처리
    스콥을 나누기 위해 즉시 실행 함수를 사용한다.
    setTimeout을 사용하면 좋지 않다.
    계속 콜백함수를 불러야 할 수도 있다.
    서버에서 html을 먼저 만들고 보내주는 것이 나은지 아니면 프로트엔드에서 하는 것이 좋은지는 명확하지 않다.
    둘다 할수도 있다.
    템플릿 작업을 하는 것이 좋다.

    구독!!!


 */
 //
 // requirejs(["helper/util"], function(util) {
 //     //This function is called when scripts/helper/util.js is loaded.
 //     //If util.js calls define(), then this function is not fired until
 //     //util's dependencies have loaded, and the util argument will hold
 //     //the module value for "helper/util".
 // });
//var Handlebars = require('handlebars');
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
