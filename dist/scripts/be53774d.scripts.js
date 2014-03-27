"use strict";var underscore=angular.module("underscore",[]);underscore.factory("_",function(){return window._});var jquery=angular.module("jquery",[]);jquery.factory("$",function(){return window.$}),angular.module("bulbsCmsApp",["ngCookies","ngResource","ngSanitize","ngRoute","ui.bootstrap","jquery","underscore"]).config(["$locationProvider","$routeProvider","$sceProvider",function(a,b,c){a.html5Mode(!0),b.when("/cms/app/list/:queue/",{templateUrl:PARTIALS_URL+"contentlist.html",controller:"ContentlistCtrl",reloadOnSearch:!1}).when("/cms/app/edit/:id/",{templateUrl:PARTIALS_URL+"contentedit.html",controller:"ContenteditCtrl"}).when("/cms/app/promotion/",{templateUrl:PARTIALS_URL+"promotion.html",controller:"PromotionCtrl",reloadOnSearch:!1}).when("/cms/app/targeting/",{templateUrl:PARTIALS_URL+"targeting-editor.html",controller:"TargetingCtrl"}).when("/cms/app/pzones/",{templateUrl:PARTIALS_URL+"pzones.html",controller:"PZoneCtrl"}).otherwise({redirectTo:"/cms/app/list/published/"}),c.enabled(!1)}]).config(["$provide",function(a){Raven.config(SENTRY_PUBLIC_DSN).install(),window.current_user&&Raven.setUser({username:window.current_user}),a.decorator("$exceptionHandler",function(a){return function(b,c){a(b,c),Raven.captureException(b)}})}]).run(["$rootScope","$http","$cookies",function(a,b,c){b.defaults.headers.post["X-CSRFToken"]=c.csrftoken}]),angular.module("bulbsCmsApp").controller("ContentlistCtrl",["$scope","$http","$timeout","$location","$routeParams","$window","$","_","Contentlist",function(a,b,c,d,e,f,g,h,i){function j(){if(!d.search().authors)return void(a.myStuff=!1);var b=d.search().authors;"string"==typeof b&&(b=[b]),a.myStuff=1===b.length&&b[0]===f.current_user?!0:!1}f.document.title="AVCMS | Content",a.search=d.search().search,a.queue=e.queue||"all",a.articles=[{id:-1,title:"Loading"}],a.myStuff=!1,j(),a.$on("$routeUpdate",function(){j()}),a.$watch("myStuff",function(){a.myStuff?g("#meOnly").bootstrapSwitch("setState",!0,!0):g("#meOnly").bootstrapSwitch("setState",!1,!0)}),g("#meOnly").on("switch-change",function(b,c){var e=c.value;e===!0?(d.search().authors=[f.current_user],a.getContent()):e===!1&&(delete d.search().authors,a.getContent())});var k="/cms/api/v1/content/";"all"!==a.queue&&(k="/cms/api/v1/content/?status="+a.queue),i.setUrl(k);var l=function(a,b){a.articles=b.results,a.totalItems=b.count};a.getContent=function(){i.getContent(a,l)},a.getContent(),a.goToPage=function(b){d.search(h.extend(d.search(),{page:b})),a.getContent()},a.sort=function(b){d.search().ordering&&0===d.search().ordering.indexOf(b)&&(b="-"+b),d.search(h.extend(d.search(),{ordering:b})),a.getContent()},a.publishSuccessCbk=function(b,c){var d;for(d=0;d<a.articles.length&&a.articles[d].id!==b.id;d++);for(var e in c)a.articles[d][e]=c[e]},a.trashSuccessCbk=function(){c(function(){a.getContent(),g("#confirm-trash-modal").modal("hide")},1500)},g(".expcol").click(function(a){a.preventDefault();var b="1"===g(this).attr("state")?"0":"1",c=b?"minus":"plus",d=b?"Collapse":"Expand",e=g(g(this).attr("href")).find(".panel-collapse");e.collapse("0"===g(this).attr("state")?"show":"hide"),g(this).html('<i class="fa fa-'+c+'-circle"></i> '+d+" all"),g(this).attr("state",b)}),g("#meOnly").bootstrapSwitch()}]).directive("ngConfirmClick",[function(){return{link:function(a,b,c){var d=c.ngConfirmClick||"Are you sure?",e=c.confirmedClick;b.bind("click",function(){window.confirm(d)&&a.$eval(e)})}}}]),angular.module("bulbsCmsApp").controller("ContenteditCtrl",["$scope","$routeParams","$http","$window","$location","$timeout","$compile","$q","$","IfExistsElse",function(a,b,c,d,e,f,g,h,i,j){function k(b){return function(c){a.article.ratings[b].media_item=c,a.mediaItemCallbackCounter-=1}}function l(a){return function(){m(a)}}function m(b){var d=a.article.ratings[b].type,e=a.article.ratings[b].media_item,f="/reviews/api/v1/"+d+"/",g="POST";e.id&&(f+=e.id+"/",g="PUT"),c({url:f,method:g,data:e}).success(function(c){a.article.ratings[b].media_item=c,a.mediaItemCallbackCounter-=1}).error(o)}function n(){i("#save-article-btn").html("<i class='fa fa-refresh fa-spin'></i> Saving"),c({url:"/cms/api/v1/content/"+(a.article.id||"")+"/",method:"PUT",data:a.article}).success(p).error(o)}function o(b,c){return 403===c?(a.showLoginModal(),void i("#save-article-btn").html("Save")):(i("#save-article-btn").html("<i class='fa fa-frown-o' style='color:red'></i> Error!"),400===c&&(a.errors=b),void a.saveArticleDeferred.reject())}function p(b){i("#save-article-btn").html("<i class='fa fa-check' style='color:green'></i> Saved!"),setTimeout(function(){i("#save-article-btn").html("Save")},1e3),a.article=b,a.errors=null,e.search("rating_type",null),s(),a.saveArticleDeferred.resolve(b)}function q(e){c({url:"/cms/api/v1/content/"+b.id+"/",method:"GET"}).success(function(b){a.article=b,d.article=a.article,e&&e(b)}).error(function(b,c){a.errors=a.errors||{},500===c&&(a.errors["Server Error"]=a.errors["Server Error"]||[],a.errors["Server Error"].push("There was a problem with the content API."))})}function r(){i(".edit-page").one("change input","input,div.editor",function(){window.onbeforeunload=function(){return"You have unsaved changes. Leave anyway?"}})}function s(){window.onbeforeunload=function(){}}a.PARTIALS_URL=d.PARTIALS_URL,a.CONTENT_PARTIALS_URL=d.CONTENT_PARTIALS_URL,a.CACHEBUSTER=d.CACHEBUSTER,a.MEDIA_ITEM_PARTIALS_URL=d.MEDIA_ITEM_PARTIALS_URL,a.$watch(function(){return"AVCMS | Editing "+(a.article&&i("<span>"+a.article.title+"</span>").text())||""},function(a){d.document.title=a}),i("body").removeClass();var t=i(g(i("#edit-page-nav-bar-template").html())(a));i("ul.edit-page-nav").html(t),i("ul.nav").show(),a.tagDisplayFn=function(a){return a.name},a.tagCallback=function(b,c,d){var e=d?b:b.name;j.ifExistsElse("/cms/api/v1/tag/?ordering=name&search="+encodeURIComponent(e),{name:e},function(b){a.article.tags.push(b)},function(b){a.article.tags.push({name:b.name,type:"content_tag","new":!0})},function(b,c){403===c&&a.showLoginModal()}),i(c).val("")},a.sectionCallback=function(b,c,d){var e=d?b:b.name;j.ifExistsElse("/cms/api/v1/tag/?ordering=name&search="+encodeURIComponent(e),{name:e},function(b){a.article.tags.push(b)},function(){console.log("Can't create sections.")},function(b,c){403===c&&a.showLoginModal()}),i(c).val("")},a.removeTag=function(b){var c=i(b.target).parents("[data-tag]").data("tag"),d=c.id,e=[];for(var f in a.article.tags)a.article.tags[f].id!==d&&e.push(a.article.tags[f]);a.article.tags=e},a.removeAuthor=function(b){var c=i(b.target).parents("[data-author]").data("author"),d=c.id,e=[];for(var f in a.article.authors)a.article.authors[f].id!==d&&e.push(a.article.authors[f]);a.article.authors=e},a.featureTypeDisplayFn=function(a){return a.name},a.featureTypeCallback=function(b,c,d){var e=d?b:b.name;j.ifExistsElse("/cms/api/v1/things/?type=feature_type&q="+encodeURIComponent(e),{name:e},function(b){a.article.feature_type=b.name,i("#feature-type-container").removeClass("newtag")},function(b){a.article.feature_type=b.name,i("#feature-type-container").addClass("newtag")},function(b,c){403===c&&a.showLoginModal()})},a.authorDisplayFn=function(a){return a.first_name&&a.last_name&&a.first_name+" "+a.last_name||"username: "+a.username},a.authorCallback=function(b,c){for(var d in a.article.authors)if(a.article.authors[d].id===b.id)return;a.article.authors.push(b),i(c).val("")},a.saveArticleDeferred=h.defer(),a.mediaItemCallbackCounter=void 0,a.$watch("mediaItemCallbackCounter",function(){0===a.mediaItemCallbackCounter&&n()}),a.saveArticle=function(){var b=a.article;a.article.title=a.editors.content_title_editor.getContent(),"Published"!==a.article.status&&(a.article.slug=d.URLify(a.article.title,50)),a.article.subhead=a.editors.content_subhead_editor.getContent(),a.editors.content_body_editor&&(a.article.body=a.editors.content_body_editor.getContent()),a.mediaItemCallbackCounter=b.ratings&&b.ratings.length||n();for(var c in b.ratings){var e;if("tvseason"===b.ratings[c].type){var f=b.ratings[c].media_item.identifier;e=b.ratings[c].media_item.show,j.ifExistsElse("/reviews/api/v1/tvseason/?season="+f+"&show="+encodeURIComponent(e),{identifier:f,show:e},k(c),l(c),o)}else if("tvepisode"===b.ratings[c].type){e=b.ratings[c].media_item.show;{var g=b.ratings[c].media_item.season,h=b.ratings[c].media_item.episode;b.ratings[c].media_item.title}j.ifExistsElse("/reviews/api/v1/tvepisode/?show="+encodeURIComponent(e)+"&season="+g+"&episode="+h,{show:e,season:g,episode:h},k(c),l(c),o)}else m(c)}return a.saveArticleDeferred.promise},a.displayAuthorAutocomplete=function(a){return a.first_name+" "+a.last_name},q(function(b){d.cock=b,!e.search().rating_type||b.ratings&&0!==b.ratings.length||(a.article.ratings=[{type:e.search().rating_type}]),a.$watch("article.detail_image.id",function(b,c){a.article&&(b&&c&&b===c||null!==b&&(!a.article.image||!a.article.image.id||b&&c&&a.article.image&&a.article.image.id&&c===a.article.image.id||!c&&b)&&(a.article.image={id:b,alt:null,caption:null}))})}),r(),i("#extra-info-modal").on("shown.bs.modal",function(){d.picturefill()}),a.initEditor=function(b,c,d,e){a.editors=a.editors||{},a.editors[b]=new window.Editor(d),angular.element(c+" .editor").bind("input",function(){a.article[e]=a.editors[b].getContent()})},d.initEditor=a.initEditor,a.$on("$destroy",function(){for(var b in a.editors)a.editors[b].destroy()}),a.addRating=function(b){a.article.ratings.push({grade:"",type:b,media_item:{type:b}}),i("#add-review-modal").modal("hide")},a.deleteRating=function(b){a.article.ratings.splice(b,1)},a.publishSuccessCbk=function(){q()},a.trashSuccessCbk=function(){f(function(){d.history.back()},1500)}}]),angular.module("bulbsCmsApp").controller("NavCtrl",["$scope","$location","$window",function(a,b,c){a.STATIC_URL=c.STATIC_URL,a.isEditPage=0===b.path().indexOf("/cms/app/edit/")?!0:!1,console.log("is Edit Page: "+a.isEditPage),a.isEditPage||$("ul.nav").show(),a.isActive=function(a){return 0===b.path().indexOf(a)}}]),angular.module("bulbsCmsApp").controller("PromotionCtrl",["$scope","$http","$window","Contentlist",function(a,b,c){function d(){b({method:"GET",url:"/promotions/api/contentlist/"+a.section+"/"}).success(function(b){a.promotedArticles=b.items.splice(0,6)}).error(function(){alert("Content list does not exist.")})}c.document.title="AVCMS | Promotion Tool",a.section="homepage",a.articleIsInPromotedArticles=function(b){if(a.promotedArticles)for(var c in a.promotedArticles)if(a.promotedArticles[c].id==b)return!0;return!1},a.$watch("section",function(){d()}),contentList.setUrl("/cms/api/v1/content/?published=True");var e=function(a,b){a.articles=b.results,a.totalItems=b.count};a.getContent=function(){contentList.getContent(a,e)},a.getContent();var f=$(".promotion-area"),g=$(".promotion-container");a.insertArticle=function(b){a.selectedArticle=b,f.addClass("select-mode"),g.off("click"),g.on("click",".promotion-area.select-mode .article-container",function(){var b=$(this).parents("[data-index]").data("index")-0;a.promotedArticles[b]&&a.promotedArticles[b].id?a.promotedArticles.splice(b,0,a.selectedArticle):a.promotedArticles.splice(b,1,a.selectedArticle),a.promotedArticles.length>6&&a.promotedArticles.pop(a.promotedArticles.length),f.removeClass("select-mode"),a.$apply()})},a.replaceArticle=function(b){a.selectedArticle=b,f.addClass("select-mode"),g.off("click"),g.on("click",".promotion-area.select-mode .article-container",function(){var b=$(this).parents("[data-index]").data("index");a.promotedArticles.splice(b,1,a.selectedArticle),f.removeClass("select-mode"),a.$apply()})},a.clearTopArticle=function(){a.promotedArticles[0]={}},a.save=function(){var c=a.promotedArticles.slice(0);c[0].id||c.shift(),$(".save-button").html('<i class="fa fa-refresh fa-spin"></i> Saving'),b({method:"PUT",url:"/promotions/api/contentlist/"+a.section+"/",data:{name:a.section,items:c}}).success(function(){$(".save-button").removeClass("btn-danger").addClass("btn-success").html('<i class="fa fa-check"></i> Saved'),window.setTimeout(function(){$(".save-button").html("Save")},2e3)}).error(function(){$(".save-button").removeClass("btn-success").addClass("btn-danger").html('<i class="fa fa-frown-o"></i> Error'),window.setTimeout(function(){$(".save-button").html("Save")},2e3)})},a.moveUp=function(b){if(0!==b){var c=a.promotedArticles[b];a.promotedArticles[b]=a.promotedArticles[b-1],a.promotedArticles[b-1]=c}},a.moveDown=function(b){if(b!==a.promotedArticles.length-1){var c=a.promotedArticles[b];a.promotedArticles[b]=a.promotedArticles[b+1],a.promotedArticles[b+1]=c}},$("body").on("shown.bs.collapse","#page-prev .collapse",function(){c.picturefill()})}]),angular.module("bulbsCmsApp").controller("PzoneCtrl",["$scope","$http","$window","contentList",function(a,b,c,d){function e(){b({method:"GET",url:"/promotions/api/pzone/"+a.pzoneName+"/"}).success(function(b){a.pzone=b}).error(function(){console.log("Zone does not exist.")})}c.document.title="AVCMS | Pzone Editor",a.pzoneName="homepage-one",a.newContentId=null,a.$watch("pzoneName",function(){e()}),a.typeChanged=function(){console.log("Type changed!"),void 0!==a.pzone&&(a.pzone.data={})},d.setUrl("/cms/api/v1/content/?published=True");var f=function(a,b){a.articles=b.results,a.totalItems=b.count};a.getContent=function(){d.getContent(a,f)},a.getContent(),a.getPZoneTemplate=function(){return PARTIALS_URL+"pzones/"+a.pzone.zone_type+".html"},a.remove=function(b){var c=a.pzone.data.content_ids.indexOf(b);-1!==c&&a.pzone.data.content_ids.splice(c,1)},a.add=function(b){void 0===a.pzone.data.content_ids&&(a.pzone.data.content_ids=[]),b&&a.newContentIdPrepend?a.pzone.data.content_ids.unshift(a.newContentIdPrepend):a.newContentId&&a.pzone.data.content_ids.push(a.newContentId),a.newContentId=null,a.newContentIdPrepend=null},a.save=function(){$("#save-pzone-btn").html('<i class="fa fa-refresh fa-spin"></i> Saving'),b({method:"PUT",url:"/promotions/api/pzone/"+a.pzoneName+"/",data:a.pzone}).success(function(){$("#save-pzone-btn").html('<i class="fa fa-check" style="color:green"></i> Saved!'),window.setTimeout(function(){$("#save-pzone-btn").html("Save")},2e3)}).error(function(){$("#save-pzone-btn").html('<i class="fa fa-frown" style="color:red"></i> Saved!'),window.setTimeout(function(){$("#save-pzone-btn").html("Save")},2e3)})}}]),angular.module("bulbsCmsApp").controller("TargetingCtrl",["$scope","$http","$window","$location",function(a,b,c,d){c.document.title="AVCMS | Targeting Editor",NProgress.configure({minimum:.4}),a.$watch("url",function(){a.url&&(a.targetingArray=[],NProgress.start(),b({method:"GET",url:"/ads/targeting",params:{url:a.url}}).success(function(b){for(var c in b)a.targetingArray.push([c,b[c]]);NProgress.done()}).error(function(b,c){404==c&&a.targetingArray.push(["",""]),NProgress.done()}))}),a.save=function(){var c={};for(var d in a.targetingArray)c[a.targetingArray[d][0]]=a.targetingArray[d][1];NProgress.start(),b({method:"POST",url:"/ads/targeting?url="+a.url,data:c}).success(function(){NProgress.done()}).error(function(){NProgress.done()})};var e=d.search();e&&e.url&&(a.url=decodeURIComponent(e.url))}]),angular.module("bulbsCmsApp").service("IfExistsElse",["$window","$http",function(a,b){this.ifExistsElse=function(a,c,d,e,f){b({url:a,method:"GET"}).success(function(a){var b,f=a.results||a;for(var g in f){b=!0;for(var h in c)if(f[g][h]!=c[h]){b=!1;break}if(b)return void d(f[g])}e(c)}).error(f)}}]),angular.module("bulbsCmsApp").service("Contentlist",["$http","$location","$timeout","$window",function(a,b,c,d){this.url="/cms/api/v1/content",this.setUrl=function(a){this.url=a},this.getContent=function(c,e){var f={};for(var g in b.search()){var h=b.search()[g];"false"!==h&&"undefined"!==h&&""!==h&&(f[g]=h)}b.search(f),f={};for(var i in b.search())f[i]=b.search()[i];c.params=f,c.currentPage=f.page||1,c.articles=[{id:-1,title:"Loading"}],d.NProgress.configure({minimum:.4}),d.NProgress.start(),a({method:"GET",url:this.url,params:f}).success(function(a){d.NProgress.done(),e(c,a)}).error(function(a,c){if(403===c){var e=b.path();d.location.href=d.location.origin+"/login?next="+e}})}}]),angular.module("bulbsCmsApp").filter("truncateByCharacters",function(){return function(a,b,c){if(isNaN(b))return a;if(0>=b)return"";if(a&&a.length>=b){if(a=a.substring(0,b),c)for(;" "===a.charAt(a.length-1);)a=a.substr(0,a.length-1);else{var d=a.lastIndexOf(" ");-1!==d&&(a=a.substr(0,d))}return 1===b?a+".":a+"..."}return a}}),angular.module("bulbsCmsApp").filter("truncateByWords",function(){return function(a,b){if(isNaN(b))return a;if(0>=b)return"";if(a){var c=a.split(/\s+/);c.length>b&&(a=c.slice(0,b).join(" ")+"...")}return a}}),angular.module("bulbsCmsApp").directive("articlecontainer",function(){return{restrict:"E",templateUrl:PARTIALS_URL+"promotion-tool-article-container.html",scope:{article:"="},link:function(a,b,c){a.ratio=c.ratio}}}),angular.module("bulbsCmsApp").directive("bulbsAutocomplete",["$http","$location","$compile","$timeout",function(a,b,c,d){return{restrict:"A",scope:!0,link:function(b,e,f){function g(c){d.cancel(j),k=0,a({method:"GET",url:f.resourceUrl+c}).success(function(a){var c=a.results||a;b.autocomplete_list=c.splice(0,5)}).error(function(a,c){403===c&&b.showLoginModal()})}b.displayfn=b[f.displayfn],b.callback=b[f.callback];var h=$(e).find("input");h.attr("autocomplete","off");var i=$(c($("#autocomplete-dropdown-template").html())(b));$(i).css({position:"absolute",top:h.position().top+h.outerHeight(),left:h.position().left,minWidth:h.outerWidth(),display:"none"}),h.parent().append(i),$(i).fadeIn("fast"),b.$watch(function(){return{top:h.position().top+h.outerHeight(),left:h.position().left,minWidth:h.outerWidth()}},function(a){$(i).css({top:a.top,left:a.left,minWidth:a.minWidth})},!0);var j,k=0;h.on("focus",function(){h.on("input",function(){var a=h.val();""===a?b.autocomplete_list=[]:(d.cancel(j),j=d(function(){g(a)},200),k>2&&g(a))}),$(i).fadeIn("fast")}),b.blurTimeout,h.on("blur",function(){$(i).fadeOut("fast")}),$(i).on("mouseover",".entry",function(){$(i).find(".selected").removeClass("selected"),$(this).addClass("selected")}),h.on("keyup",function(a){if(40===a.keyCode)if(0===$("div.selected",i).length)$("div.entry",i).first().addClass("selected");else{var c=$("div.selected",i),d=c.next("div");0===d.length?$("div.entry",i).first().addClass("selected"):d.addClass("selected"),c.removeClass("selected")}if(38===a.keyCode)if(0===$("div.selected",i).length)$("div.entry",i).last().addClass("selected");else{var c=$("div.selected",i),d=c.prev("div");0===d.length?$("div.entry",i).last().addClass("selected"):d.addClass("selected"),c.removeClass("selected")}if(13===a.keyCode){var e=$("div.selected",i);0===e.length&&b.onClick(h.val(),!0),e.click()}}),b.onClick=function(a,c){b.callback(a,h,c||!1),b.autocomplete_list=[]}}}}]),angular.module("bulbsCmsApp").directive("bettyimage",["$http",function(){return{replace:!0,restrict:"E",templateUrl:PARTIALS_URL+"bettyimage.html",scope:{image:"=",ratio:"=",width:"@"},controller:["$scope",function(){}],link:function(a,b){a.width=parseInt(a.width,10);{var c=parseInt(a.ratio.split("x")[0],10),d=parseInt(a.ratio.split("x")[1],10);a.width*d/c+"px"}b.css("width",a.width+"px"),b.css("height",a.width*d/c+"px");var e=a.image.selections[a.ratio],f=e.x1-e.x0,g=a.width/f,h=Math.round(g*(a.image.width-f)+a.width);b.css("background-image","url("+IMAGE_SERVER_URL+"/"+a.image.id+"/original/"+h+".jpg)"),b.css("background-position",g*e.x0*-1+"px "+g*e.y0*-1+"px")}}}]),angular.module("bulbsCmsApp").directive("createContent",["$http","$window","IfExistsElse",function(a,b,c){return{restrict:"E",templateUrl:PARTIALS_URL+"create-content.html",controller:["$scope",function(d){function e(){$("button.go").html('<i class="fa fa-refresh fa-spin"></i> Going'),a({url:"/cms/api/v1/content/?doctype="+d.contentType,method:"POST",data:d.init}).success(function(a){var c=a.id,e="/cms/app/edit/"+c+"/";d.rating_type&&(e+="?rating_type="+d.rating_type),b.location.href=b.location.origin+e}).error(function(){console.log("wow. error."),$("button.go").html('<i class="fa fa-frown-o" style="color:red"></i> Error!'),d.gotSave=!1})}d.gotTags=!1,d.gotUser=!1,d.gotSave=!1,d.$watch(function(){return d.gotTags&&d.gotUser&&d.gotSave},function(a){a&&e(d.init)}),d.newArticle=function(){var a={title:d.newTitle};angular.extend(d.init,a),d.tag?c.ifExistsElse("/cms/api/v1/tag/?ordering=name&search="+encodeURIComponent(d.tag),{slug:d.tag},function(a){d.init.tags=[a],d.gotTags=!0},function(a){console.log("couldnt find tag "+a.slug+" for initial value")},function(a,b){403===b&&d.showLoginModal()}):d.gotTags=!0,c.ifExistsElse("/cms/api/v1/user/?ordering=name&search="+b.current_user,{username:b.current_user},function(a){d.init.authors=[a],d.gotUser=!0},function(){console.log("are you bruce willis in sixth sense? dunno.")},function(a,b){403===b&&d.showLoginModal()}),d.gotSave=!0}}],link:function(a,b){$(b).find("a.create-content").on("click",function(){$("a.create-content.active").removeClass("active"),$(this).addClass("active")}),$(b).find("a.create-content").on("click",function(){return a.contentTypeLabel=$(this).text(),a.contentType=$(this).data("content_type")||null,a.init=$(this).data("init")||{},a.tag=$(this).data("tag")||null,a.rating_type=$(this).data("rating_type")||null,a.$apply(),$(this).hasClass("go-next")&&$("#create button.next-pane").click(),!0}),$("button.next-pane:not(.hide)").on("click",function(){console.log("next clicked"),console.log(a.contentType),console.log(a.init),$("#createcontent-01").addClass("hidden"),$("#createcontent-02").removeClass("hidden"),$("button.next-pane:not(.hide)").addClass("hidden"),$(".new-title").focus()}),$(b).find(".new-title").on("keydown",function(a){13===a.keyCode&&$(b).find(".go").click()})}}}]),angular.module("bulbsCmsApp").directive("devicepreview",function(){return{restrict:"E",templateUrl:PARTIALS_URL+"devicepreview.html",link:function(){var a=$("#page-prev"),b=a.find(".nav a"),c=a.find(".tab-content .active");b.click(function(a){var b=$(this).attr("href").split("#")[1];a.preventDefault(),c.attr("id",b)}),$("#page-prev").on("show.bs.collapse",function(){$(this).find(".fa").removeClass("fa-plus-square-o").addClass("fa-minus-square-o")}),$("#page-prev").on("hide.bs.collapse",function(){$(this).find(".fa").removeClass("fa-minus-square-o").addClass("fa-plus-square-o")})}}}),angular.module("bulbsCmsApp").directive("filterwidget",["$http","$location","$window","$timeout",function(a,b,c,d){return{restrict:"E",templateUrl:PARTIALS_URL+"filterwidget.html"+CACHEBUSTER,link:function(c,e){function f(b){return d.cancel(l),m=0,b.length<1?(c.autocompleteArray=new Array,void c.$apply()):void a({url:"/cms/api/v1/things/?type=tag&type=feature_type&type=author",method:"GET",params:{q:b}}).success(function(a){c.autocompleteArray=a})}function g(a){var b,d=j.find(".entry"),e=j.find(".entry.selected");e.length>0?("up"==a&&(b=e.first().prev()),"down"==a&&(b=e.first().next())):("up"==a&&(b=d.last()),"down"==a&&(b=d.first())),c.selectEntry(b)}function h(a){a.page=1,b.search(a),c.getContent(),c.autocompleteArray=new Array,k.trigger("blur")}function i(b,d){c.queryToLabelMappings=c.queryToLabelMappings||{},d in c.queryToLabelMappings||a({url:"/cms/api/v1/things/?type="+b,method:"GET",params:{q:d}}).success(function(a){for(var b in a)c.queryToLabelMappings[a[b].value]=a[b].name})}var j=$(e),k=j.find("input");c.searchTerm,c.autocompleteArray=new Array;var l,m=0;k.on("input",function(){var a=k.val();c.searchTerm=a,d.cancel(l),l=d(function(){f(a)},200),m>2&&f(a)}),k.on("keyup",function(a){38==a.keyCode&&g("up"),40==a.keyCode&&g("down"),13==a.keyCode&&(j.find(".selected").length>0?j.find(".selected").click():c.addFilter("search",k.val()))}),j.find(".search-button").on("click",function(){c.addFilter("search",k.val())}),j.find(".clear-button").on("click",function(){$(this).prev("input").val(""),c.filterObjects={},h({})}),j.on("mouseover",".entry",function(){c.selectEntry(this)}),c.selectEntry=function(a){j.find(".selected").removeClass("selected"),$(a).addClass("selected")},k.on("blur",function(){j.find(".dropdown-menu").fadeOut(200)}),k.on("focus",function(){j.find(".dropdown-menu").fadeIn(200)}),c.addFilter=function(a,d){var e=b.search();"search"==a?e.search=d:(e[a]||(e[a]=[]),"string"==typeof e[a]&&(e[a]=[e[a]]),e[a].push(d),k.val("")),h(e),c.filterInputValue=""},c.deleteFilter=function(a){var d=b.search(),e=c.filterObjects[a];"string"==typeof d[e.type]&&(d[type]=[d[type]]);var f;for(var g in d[e.type])if(d[e.type][g]==e.query){f=g;break}d[e.type].splice(g,1),d.search=k.val(),delete c.filterObjects[a],h(d)},c.$watch("locationSearch",function(a){if(c.filterObjects={},"undefined"!=typeof a){var b={authors:"author",tags:"tag",feature_types:"feature_type"};for(var d in b){var e=b[d];"string"==typeof a[d]&&(a[d]=[a[d]]);for(var f in a[d]){var g=a[d][f];c.filterObjects[e+g]={query:g,type:d},i(e,g)}}a.search&&(c.filterInputValue=a.search)}}),c.$on("$routeUpdate",function(){c.locationSearch=b.search()}),c.locationSearch=b.search()}}}]),angular.module("bulbsCmsApp").directive("imagedrawer",["$http","$window",function(a,b){return{restrict:"E",templateUrl:PARTIALS_URL+"imagedrawer.html",scope:{openImageDrawer:"=",closeImageDrawer:"=",article:"="},controller:["$scope",function(c){function d(a,b){return[parseInt(a*b[0]),parseInt(a*b[1]),parseInt(a*b[2]),parseInt(a*b[3])]}c.current_image={},c.$watch("current_image",function(){c.library_images=e(c.library_images,c.current_image)}),c.library_images=[];var e=function(a,b){var c=a;if(b.id){for(var d in c)if(c[d].id==b.id){c.splice(d,1);break}c.unshift(b)}return c},f=function(d){d=d||{},a({method:"GET",url:b.BC_ADMIN_URL+"/api/search",params:d,headers:{"X-Betty-Api-Key":"c44027184faf2dc61d6660409dec817daaa75decfa853d68250cbe8e"}}).success(function(a){c.library_images=e(a.results,c.current_image)})};c.drawerUpload=function(){b.uploadImage({onProgress:function(){},onSuccess:function(a){f(),c.onChangeFn(a),c.current_image=a},onError:c.onCancelFn,onCancel:c.onCancelFn})};var g=function(d,e){a({url:b.BC_ADMIN_URL+"/api/"+d,method:"GET",headers:{"X-Betty-Api-Key":"c44027184faf2dc61d6660409dec817daaa75decfa853d68250cbe8e"}}).success(function(a){e?c.current_image[e]=a[e]:c.current_image=a,b.picturefill(!0)}).error(function(){c.current_image={}})};b.refreshCurrentImage=g,c.$watch("imageLibrarySearch",function(){f({q:c.imageLibrarySearch})}),c.openImageDrawer=function(){if("function"==typeof arguments[0])var a=null,b=arguments[0],d=arguments[1],e=arguments[2];else var a=arguments[0],b=arguments[1],d=arguments[2],e=arguments[3];$("#image-drawer").off("click"),$("#image-drawer").on("click","#image-library.image",function(){var a=$(this).data("imageId");g(a),b(a)}),a&&(c.original_image=a),g(a),c.oldId=a,c.onChangeFn=b,c.onSaveFn=d,c.onCancelFn=function(a){c.original_image&&g(c.original_image),e(a)},$("body").addClass("image-drawer-cropper-open"),f()},b.openImageDrawer=c.openImageDrawer,c.openImageLibrary=function(){c.libraryOpen=!0,$("body").addClass("image-drawer-library-open"),b.picturefill(!0)},c.closeImageDrawer=function(){$("body").removeClass("image-drawer-cropper-open"),$("body").removeClass("image-drawer-library-open"),b.picturefill()},c.closeImageLibrary=function(a){"save"===a&&c.onSaveFn(),"cancel"===a&&c.onCancelFn(c.oldId),$("body").removeClass("image-drawer-library-open"),c.libraryOpen=!1},c.saveImageData=function(a){b.saveImageData(a)},c.saveNewCrop=function(a,d){a.selections[d]={x0:j[0],y0:j[1],x1:j[2],y1:j[3]},c.$apply(),b.saveNewCrop(a,d,j,{onSuccess:function(){g(a.id,"selections")}})};var h,i,j;$("#cropperModal").on("hidden.bs.modal",function(){h.destroy()}),$("#cropperModal").on("shown.bs.modal",function(){b.picturefill()}),c.cropImage=function(a,b){var e=500;$("#cropper-img").attr("src",IMAGE_SERVER_URL+"/"+a.id+"/original/"+e+".jpg");var f=b.split("x")[0],g=b.split("x")[1],k=e/a.width,l=[a.selections[b].x0,a.selections[b].y0,a.selections[b].x1,a.selections[b].y1],m=function(a){var b=[a.x,a.y,a.x2,a.y2];i=b,j=d(1/k,b)};$("#cropper-modal-save-button").unbind("click"),$("#cropper-modal-save-button").click(function(){c.saveNewCrop(a,b)}),$("#cropperModal").modal("show"),$("#cropper-img").Jcrop({onSelect:m,allowMove:!0,allowResize:!0,aspectRatio:f/g},function(){h=this,h.setOptions({aspectRatio:f/g}),this.focus();d(k,l);this.setSelect(d(k,l))})}}],link:function(a){function c(a){a=a||window.event,a.preventDefault&&a.preventDefault(),a.returnValue=!1}a.IMAGE_SERVER_URL=b.IMAGE_SERVER_URL,document.getElementById("image-cropper").onmousewheel=function(a){document.getElementById("image-cropper").scrollTop-=a.wheelDeltaY,c(a)},document.getElementById("image-library-body").onmousewheel=function(a){document.getElementById("image-library-body").scrollTop-=a.wheelDeltaY,c(a)}}}}]),angular.module("bulbsCmsApp").directive("listinput",function(){return{restrict:"E",templateUrl:PARTIALS_URL+"listinput.html",scope:{model:"="},link:function(a,b,c){a.label=c.label,a.noun=c.noun,b.find("input")[0].setAttribute("name",c.noun),b.find("input").bind("focus",function(){$(b).find(".preview").hide(),$(b).find(".all-container").show()}),b.find("input").bind("blur",function(){$(b).find(".all-container").hide(),$(b).find(".preview").show()}),b.find("input").bind("keyup",function(b){if(13===b.keyCode){var c=$(this).val();c.length>0&&(a.model||(a.model=[]),a.model.push($(this).val()),a.$apply(),$(this).val(""))}})}}}),angular.module("bulbsCmsApp").directive("login",["$http","$cookies","$window",function(a,b,c){return{restrict:"E",templateUrl:PARTIALS_URL+"login.html",link:function(d){d.showLoginModal=function(){$("#login-modal").modal("show")},c.showLoginModal=d.showLoginModal,d.login=function(){var b=$("input[name='username']").val(),c=$("input[name='password']").val(),d=$.param({username:b,password:c});a({method:"POST",url:"/login/",data:d,headers:{"Content-Type":"application/x-www-form-urlencoded"}}).success(function(){$("#login-modal").modal("hide")}).error(function(a){console.log("error"),console.log(a)})},d.$watch(function(){return b.csrftoken},function(b){a.defaults.headers.post["X-CSRFToken"]=b,c.jqueryCsrfSetup()})}}}]),angular.module("bulbsCmsApp").directive("videoUpload",["$http","$window","$timeout","$sce",function(a,b,c,d){return{templateUrl:PARTIALS_URL+"mainvideo.html",scope:{article:"="},restrict:"E",link:function(e,f){function g(){i(0),e.req&&e.req.abort(),e.video={},i(0)}function h(){$.ajax("https://app.zencoder.com/api/v2/jobs/"+e.video.job_id+"/cancel.json?api_key="+b.videoAttrs.zencoderApiKey,{type:"PUT",success:function(){e.video.status=3,m.val("Encoding failed! Please try again.")}})}function i(a){return 0===a||100===a?void k.hide():void((0===e.lastProgress||Math.abs(a-e.lastProgress)>2)&&(l.css("width",Math.floor(a)+"%"),e.lastProgress=a,k.show()))}function j(){l.addClass("progress-bar-success"),delete a.defaults.headers.common["X-Requested-With"],a({url:"https://app.zencoder.com/api/v2/jobs/"+e.video.job_id+"/progress.json",method:"GET",params:{api_key:b.videoAttrs.zencoderApiKey},useXDomain:!0}).success(function(a){"waiting"===a.state||"pending"===a.state||"processing"===a.state?(e.video.status=2,a.progress>5?(i(a.progress),c(j,500)):c(j,2e3)):(i(0),"finished"==a.state&&(e.video.status=1),("failed"==a.state||"cancelled"==a.state)&&(e.video.status=3,m.val("Encoding failed! Please try again.")))}).error(function(){$(".alert-danger").fadeIn().delay(1e3).fadeOut()})}console.log("video upload here"),console.log(e.video_id),e.$watch("article.video",function(){e.article.video&&(e.embedUrl=d.trustAsUrl("/videos/embed?id="+e.article.video),a({method:"GET",url:"/videos/api/video/"+e.article.video+"/"}).success(function(a){console.log("getting video from API"),console.log(a),e.video=a,b.initVideoWidget(a.id)}))}),e.$watch("video",function(){});var k=(f.find("label.btn"),f.find("div.progress")),l=f.find("div.progress-bar"),m=(f.find("div.progress span"),f.find("input.fake-input"));e.lastProgress=0,e.addVideo=function(){console.log("chooseFile"),b.uploadVideo(f.find(".video-container")[0],{onSuccess:function(a){e.$apply(function(){console.log("addVideo onSuccess callback"),console.log(a),e.article.video=a
})},onError:function(a){console.log("addVideo onError callback"),console.log(a)},onProgress:function(a){console.log("addVideo onProgress callback"),console.log(a)}})},e.clearVideo=function(a){a?($("#s3upload-file-input").val(""),e.article.video=null):$("#confirm-clear-video-modal").modal("show")},e.abort=function(){return e.encoding?void h():void g()};var n=!1;e.$watch("video",function(){e.video&&e.video.job_id&&!n&&(j(),n=!0)})}}}]),angular.module("bulbsCmsApp").directive("publishContent",["$http",function(a){return{restrict:"E",templateUrl:PARTIALS_URL+"publish-content.html",link:function(b){function c(c,d){a({url:"/cms/api/v1/content/"+c.id+"/publish/",method:"POST",data:d}).success(function(a){b.publishSuccessCbk(c,a)}).error(function(a,c){403===c&&b.showLoginModal()})}b.openPubTimeModal=function(a){b.pubTimeArticle=a},b.openSendToEditorModal=function(a){b.pubTimeArticle=a},b.pubTimeCancel=function(){b.pubTimeArticle=null},b.pubTimeSave=function(a){if(!a.feature_type)return void $("#pubTimeValidationModal").modal("show");var b=$("#chooseDate .date input").val();b&&(b=moment(b,"MM/DD/YYYY hh:mm a CST").format("YYYY-MM-DDTHH:mmZ"));var d={published:b};c(a,d)},b.pubUnpublish=function(a){$("#chooseDate .date input").val("");var b={published:!1};c(a,b)},$("#chooseDate .datetimepicker2").datetimepicker({language:"en",pick12HourFormat:!0,pickSeconds:!1,maskInput:!1}),b.sendToEditor=function(c){a({url:"/cms/api/v1/content/"+c.id+"/send/",method:"POST",data:{notes:b.noteToEditor}}).success(function(a){b.publishSuccessCbk(c,a)})},b.saveThenOpenSendModal=function(a){b.saveArticle().then(function(){b.openSendToEditorModal(a),$("#sendToEditor").modal("show")})},b.saveThenPublish=function(a){b.saveArticle().then(function(){b.openPubTimeModal(a),$("#chooseDate").modal("show")})}}}}]),angular.module("bulbsCmsApp").directive("mediaRating",["$http",function(a){return{restrict:"E",templateUrl:PARTIALS_URL+"rating.html",scope:!0,controller:["$scope",function(b){b.search=function(c){b.searchTimeout=null;for(var d=c.find(".media-field input"),e={},f=0;f<d.length;f++)""!==$(d[f]).val()&&(e[$(d[f]).attr("name")]=$(d[f]).val());a({method:"GET",url:"/reviews/api/v1/"+b.article.ratings[b.index].type+"/search",params:e}).success(function(a){b.searchResults=[];for(var c in a)for(var d in a[c])b.searchResults.push(a[c][d])})},b.mediaItemTemplate=function(){return b.MEDIA_ITEM_PARTIALS_URL+b.article.ratings[b.index].type.toLowerCase()+".html"+CACHEBUSTER},b.tvShowDisplay=function(a){return a.name},b.tvShowCallback=function(a,c,d){b.article.ratings[b.index].media_item.show=d?$(c).val():a.name}}],link:function(b,c,d){var e=$(c);b.index=d.index,b.searchResults=[],e.on("keypress","input.letter",function(a){var b={65:"A",66:"B",67:"C",68:"D",70:"F",97:"A",98:"B",99:"C",100:"D",102:"F"},c={45:"-",95:"_",43:"+",61:"+"};if(a.charCode in b||a.charCode in c){var d=$(this).val(),e=d.match(/[ABCDF]/);e=e?e[0]:"";var f=d.match(/[+-]/);f=f?f[0]:"";var g;a.charCode in b&&(g=b[a.charCode]+f),a.charCode in c&&(g=e+c[a.charCode]),$(this).val(g),$(this).trigger("input")}return!1}),b.searchTimeout=null,e.on("keyup",'input[name="show"]',function(){var c=e.find('input[name="show"]').val();a({method:"GET",url:"/reviews/api/v1/tvshow/?format=json",params:{q:c}}).success(function(a){b.shows=a.results})})}}}]),angular.module("bulbsCmsApp").directive("responsiveImage",["$window",function(a){return{link:function(b,c,d){d.$observe("imageId",function(){$(c).find("img").remove(),c.attr("data-image-id",d.imageId),c.attr("data-crop",d.crop),d.imageId&&$(c).is(":visible")&&(a.pictureFillElement(c[0]),c.show())})}}}]),angular.module("bulbsCmsApp").directive("targeting",function(){return{restrict:"E",templateUrl:PARTIALS_URL+"targeting.html",link:function(a){a.addTargetingRow=function(){a.targetingArray.push([])},a.removeTargetingRow=function(b){a.targetingArray.splice(b,1)}}}}),angular.module("bulbsCmsApp").directive("titleimage",["$http","$window",function(a,b){return{restrict:"E",templateUrl:PARTIALS_URL+"titleimage.html",scope:{article:"=",image:"="},link:function(a,c,d){var e=$(c);"false"===d.caption&&(a.hideCaption=!0),a.format=d.format||"jpg",a.crop=d.crop||"16x9",a.placeholderText=d.placeholderText||"Optional Image",a.removeTitleImage=function(){a.image=null},a.addTitleImage=function(){b.uploadImage({onSuccess:function(c){a.$apply(function(){a.image={id:c.id.toString(),alt:null,caption:null},setTimeout(b.picturefill,200)})},onError:function(b){a.$apply(function(){alert("Error: ",b)})},onProgress:function(){}})},a.editTitleImage=function(){b.openImageDrawer(a.image.id,function(c){function d(){e.find(".image img[src='"+b.LOADING_IMG_SRC+"']").remove()}d(),e.find(".image").data("imageId")!=c.id&&(e.find(".image img").on("load",d),e.find(".image img").after('<img src="'+b.LOADING_IMG_SRC+'">'),a.image.id=c.id.toString(),a.$apply(),b.picturefill(),e.find(".image img")[0].complete&&d())},function(){},function(c){a.image=c,b.picturefill()})}}}}]),angular.module("bulbsCmsApp").directive("trashContent",["$http",function(a){return{restrict:"E",templateUrl:PARTIALS_URL+"trash-content.html",link:function(b){b.trashContent=function(c){c===!0?($("#trash-confirm-button").html('<i class="fa fa-refresh fa-spin"></i> Trashing'),a({method:"POST",url:"/cms/api/v1/content/"+b.articleIdToTrash+"/trash/"}).success(function(){b.trashSuccessCbk()}).error(function(a,c){404===c?b.trashSuccessCbk():403===c?b.showLoginModal():$("#trash-confirm-button").html('<i class="fa fa-frown-o" style="color:red"></i> Error!')})):(b.articleIdToTrash=c,$("#confirm-trash-modal").modal("show"))}}}}]);