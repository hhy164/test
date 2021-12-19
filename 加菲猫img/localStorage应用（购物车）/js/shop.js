
var selectData = {};//用来存储所有的商品信息和商品
function init() {
    selectData = JSON.parse(localStorage.getItem('shoppingCart')) || {};
    //第一次取到的结果为空，但是转为JSON.parse以后返回的结果为null
    createSelectDom();

}
init();
// 请求数据
ajax('js/shoppingData.json', function (data) {
    createGoodsDom(data);
    addEvent();

});

// 创建商品结构
function createGoodsDom(data) {
    var str = '';
    data.forEach(function (item) {

        var color = ''; //用来存储每条数据里的所有颜色信息
        item.list.forEach(function (product) {
            color += '<span data-id="' + product.id + '">' + product.color + '</span>'


        })

        //商品结构创捷
        str += '<tr>' +
            '<td>' +
            '<img src="' + item.list[0].img + '" />' +
            '</td>' +
            '<td>' +
            '<p>' + item.name + '</p>' +
            '<div class="color">' + color + '</div>' +
            '</td>' +
            '<td>' + item.list[0].price + '.00元' + '</td>' +
            '<td>' +
            '<span>-</span>' +
            '<strong>0</strong>' +
            '<span>+</span>' +
            '</td>' +
            '<td><button>加入购物车</button></td>' +
            '</tr>';


    })

    var tbody = document.querySelector('.product tbody');
    tbody.innerHTML = str;


}

// 添加商品点击事件
function addEvent() {
    var trs = document.querySelectorAll('.product tr');//获取到所有的行
    for (var i = 0; i < trs.length; i++) {
        action(trs[i], i);
    }
    function action(tr, n) {
        var tds = tr.children,//当前行里所有的td
            img = tds[0].children[0],//商品图片
            imgSrc = img.getAttribute('src'),//商品图片地址
            name = tds[1].children[0].innerHTML,//商品名字
            colors = tds[1].children[1].children,//所有颜色按钮
            price = parseFloat(tds[2].innerHTML),//价格
            spans = tds[3].querySelectorAll('span'),//加减按钮
            strong = tds[3].querySelector('strong'),//数量
            joinBtn = tds[4].children[0],//加入购物车的按钮
            selectNum = 0;//选中商品的数量

        //颜色按钮点击功能
        var last = null, //上次选中的按钮
            colorValue = '',//选中的颜色
            colorId = '';//选中商品的ID

        for (var i = 0; i < colors.length; i++) {
            colors[i].index = i;//添加一个自定义的属性为索引值
            colors[i].onclick = function () {
                last && last != this && (last.className = "");
                this.className = this.className ? "" : 'active';
                colorValue = this.className ? this.innerHTML : "";
                colorId = this.className ? this.dataset.id : '';
                imgSrc = this.className ? 'images/img_0' + (n + 1) + '-' + (this.index + 1) + '.png' : 'images/img_0' + (n + 1) + '-1.png';

                img.src = imgSrc;

                last = this;//把当前次点击的对象赋值给last
            }
        }

        //减按钮点击
        spans[0].onclick = function () {
            selectNum--;
            if (selectNum < 0) {
                selectNum = 0;
            }
            strong.innerHTML = selectNum;
        }

        //加按钮点击 
        spans[1].onclick = function () {
            selectNum++;
            strong.innerHTML = selectNum;
        };

        // 加入购物车
        joinBtn.onclick = function () {
            if (!colorValue) {
                alert('请选择颜色');
                return;
            } else if (!selectNum) {
                alert('请添加购买数量');
                return;
            }

            //给selectData对象赋值
            selectData[colorId] = {
                'id': colorId,
                'name': name,
                'color': colorValue,
                'price': price,
                'num': selectNum,
                'img': imgSrc,
                'time': new Date().getTime(),

            };
            localStorage.setItem('shoppingCart', JSON.stringify(selectData));
            //加入购物车后让所有已经选择的内容还原
            img.src = 'images/img_0' + (n + 1) + '-1.png';
            last.className = "";
            strong.innerHTML = selectNum = 0;

            createSelectDom();//存储完数据后要渲染购物车里商品的结构
        }
    }
}

//创建购物车商品结构
function createSelectDom() {
    var tbody = document.querySelector('.selected tbody');
    var totalPrice = document.querySelector('.selected th strong');
    var str = "";
    var total = 0;//总共多少钱

    var goods = Object.values(selectData);

    //对已选择的商品进行排序
    goods.sort(function (g1, g2) {
        return g2.time - g1.time;
    })

    tbody.innerHTML = "";
    for (var i = 0; i < goods.length; i++) {
        str += '<tr>' +
            '<td>' +
            '<img src="' + goods[i].img + '" />' +
            '</td>' +
            '<td>' +
            '<p>' + goods[i].name + '</p>' +
            '</td>' +
            '<td>' + goods[i].color + '</td>' +
            '<td>' + (goods[i].price) * (goods[i].num) + '.00元</td>' +
            '<td>x' + goods[i].num + '</td>' +
            '<td>' + '<button data-id="' + goods[i].id + '">删除</button></td>' +
            '</tr>'

        total += goods[i].price * goods[i].num;
    }
    tbody.innerHTML = str;
    totalPrice.innerHTML = total + '.00元';

    del();//结构创建完成后，添加删除功能

}



// 删除功能
function del() {
    var btns = document.querySelectorAll('.selected tbody button');
    var tbody = document.querySelector('.selected tbody');
    for (var i = 0; i < btns.length; i++) {
        btns[i].onclick = function () {
            //删除对象里的数据
            delete selectData[this.dataset.id];
            localStorage.setItem('shoppingCart', JSON.stringify(selectData));
            //删除dom结构
            tbody.removeChild(this.parentNode.parentNode);

            //更新总价格
            var totalPrice = document.querySelector('.selected th strong');
            totalPrice.innerHTML = parseFloat(totalPrice.innerHTML) - parseFloat(this.parentNode.parentNode.children[3].innerHTML) + '.00元';

        }
    }

}

//storage事件
window.addEventListener('storage',function(ev){

    console.log(ev.key);//修改的是哪一个localStorage(名字Key)
    console.log(ev.newValue);//修改后的数据
    console.log(ev.oldValue);//修改前的数据
    console.log(ev.storageArea);
    console.log(ev.url); //返回操作的那个页面的url
    init();
});