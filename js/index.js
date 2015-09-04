/*主页js*/
var timer

function endWel() { //图片预加载完,结束开始动画
	var arrPic = ['img/1.jpg', 'img/2.jpg', 'img/3.jpg', 'img/4.jpg', 'img/5.jpg', 'img/camera1.png', 'img/camera2.png', 'img/formBg.png', 'img/mask.png', 'img/news.png', 'img/tranks2.png']
	var oImg = new Image()
	var imgLoad = false
	var iCur = 0
	var timer
	var time = new Date().getTime()
	preLoad(iCur) //图片预加载
	timer = setInterval(function() { //实时监听预加载和动画情况
		if (new Date().getTime() - time >= 4000 && imgLoad) {
			clearInterval(timer)
			if (!window.nHome) {
				fnHome() //主页出现
				window.nHome = true
			}
		}
	}, 1000)

	function preLoad(iCur) {
		oImg.src = arrPic[iCur]
		oImg.onload = function() {
			iCur++
			if (iCur == arrPic.length) {
				console.log('加载完了')
				return
			} else if (iCur == 5) {
				imgLoad = true
			}
			preLoad(iCur)
		}
	}
}

function fnHome() {
	$('#fit').css('display', 'block') //适配层出现
	$('#home').attr('class', 'page showPage') //主页出现
	$('#welcome').css('opacity', 0) //欢迎页淡出
	setTimeout(function() { //动画退出
		$('#welcome').attr('class', 'page') //欢迎页退场，首页开始
			//需要js设定height，适配4：3的页面
		$('#home').css('height', Math.max(1065, document.documentElement.clientHeight))
		fnTab() //开启轮播
		if (!window.nScore) {//因为循环复用，所以避免重复添加
			fnScore() //开启评分
			window.nScore = true
		}
		if (!window.nCom) {
			fnCom() //开启评论
			window.nCom = true
		}
		if (!window.nSub) {
			fnSub() //开启提交
			window.nSub = true
		}
	}, 1500)
}

function fnSub() {
	var score1, score2, score3, comm
	$('.comment input').click(function() {
		fnSubmit() //开启提交
	})
}

function fnTab() { //图片切换以及拖拽函数
	var oUl = $('#home .show')
	var aSpan = $('#home .note span')
	var iNow = 0
	var size = aSpan.size()
	var l, L, posL
	autoTab()
	oUl.css('-webkit-transition', '1s') //只有设置在行间的样式js才可以很好的控制

	function autoTab() {
		timer = setInterval(function() {
			iNow++
			iNow %= size
			change()
		}, 3000)
	}

	function change() {
		oUl.css('-webkit-transform', 'translateX(' + (-iNow * 640) + 'px)') //图片位置变化
		aSpan.attr('class', '')
		aSpan.eq(iNow).attr('class', 'active') //当前span变色
	}
	if (!window.nTab) { //避免重复添加
		window.nTab = true
	} else {
		return
	}
	oUl.on('touchstart', function(ev) {
		clearInterval(timer)
		ev = ev.changedTouches[0]
		l = ev.pageX
		posL = l - $(this).position().left
	})
	oUl.on('touchmove', function(ev) {
		ev.preventDefault()
		ev = ev.changedTouches[0]
		L = ev.pageX
		$(this).css('-webkit-transition', '').css('-webkit-transform', 'translateX(' + (L - posL) + 'px)')
	})
	oUl.on('touchend', function() {
		$(this).css('-webkit-transition', '.3s linear') //设定拖拽后释放时的过渡
		if ((L - l) / 640 > 0.3) {
			iNow--
		} else if ((l - L) / 640 > 0.3) {
			iNow++
		}
		if (iNow == -1) {
			iNow = 0
		} else if (iNow == size) {
			iNow = size - 1
		}
		change()
		setTimeout(function() { //给渲染一个时间
			oUl.css('-webkit-transition', '1s') //恢复正常过渡
		}, 20)
		autoTab()
	})
}

function fnScore() { //评分函数
	var aA = $('.score a')
	var This
	aA.on('touchend', function() {
		This = $(this)
		switch (This.closest('li').index()) { //记录评分结果以便传给后端
			case 0:
				score1 = This.index() + 1
				break;
			case 1:
				score2 = This.index() + 1
				break;
			case 2:
				score3 = This.index() + 1
		}
		$(this).parent().children().attr('class', '') //他的兄弟都干空
		while (This.length) { //当前的和它之前的都变色
			This.attr('class', 'active').css('opacity', 1)
			This = This.prev()
		}
	})
}

function fnCom() { //点击添加标签函数
	var aSp = $('.comment span')
	aSp.on('click', function() {
		comm = $(this).html()
		aSp.attr('class', '')
		$(this).attr('class', 'active')
	})
}

function fnSubmit() {
	var errorNum, data
	fnVerify() //开启验证
	if (errorNum == 0) { //验证通过可以上传
		data = 'score1=' + score1 + '&score2=' + score2 + '&score3=' + score3 + '&comm=' + encodeURI(comm)
		$.get('http://www.baidu.com', data)
		fnMask() //进入下一部分
	}

	function fnVerify() { //验证有无错误以及提示
		if ($('.score a:nth-of-type(1)').filter('.active').size() != 3) {
			errorNum = 1
		} else if ($('.comment span').filter('.active').size() == 0) {
			errorNum = 2
		} else {
			errorNum = 0

			return
		}
		fnError()
	}

	function fnError() { //错误提示
		var content = errorNum == 1 ? '请为景区评分' : '请为景区添加标签'
		$('#home').append($('<div id="error"><p>' + content + '<br><span>OK</span>' + '</p></div>'))
		setTimeout(function() { //给浏览器渲染个时间
			$('#error p').attr('class', 'active')
		}, 20)
		$('#error span').on('click', function() {
			$('#error').remove()
		})
	}

	function fnMask() {
		$('#mask').attr('class', 'page showPage')
		setTimeout(function() { //页面渲染中过渡不生效，所以我们等等
			$('#mask').css('opacity', '0.5')
			$('#home').css('-webkit-filter', 'blur(5px)') //首页模糊
			$('#upload').attr('class', 'page showPage') //新幕拉开
		}, 20)
		setTimeout(function() {
			$('#upload').css('opacity', '1') //新幕拉开
			$('#mask').css('opacity', '0').on('webkitTransitionEnd', function() {
					$('#mask').attr('class', 'page') //遮罩消失
					$('#home').attr('class', 'page') //旧幕消失
					clearInterval(timer) //清除autoTab的定时器
					$('#home').css('-webkit-filter', '') //取消模糊，为了下一次
					$('#fit').css('display', 'none') //旧幕消失
					if (!window.nUpload) {
						fnUpload()
						window.nUpload = true
					}
				}) //逐渐消失
		}, 1300)
	}
}

function fnUpload() {
	$('#upload input')[0].onchange = function() {
		if (this.files[0].type.split('/')[0] == 'video') {
			//使用ajax上传
			fnForm()
			this.value = ''//清空上传数据
		} else {
			fnError2($('#upload'),'请上传视频格式')
		}
	}

	$('#upload input')[1].onchange = function() {
		if (this.files[0].type.split('/')[0] == 'image') {
			//使用ajax上传
			fnForm()
			this.value = ''
		} else {
			fnError2($('#upload'),'请上传图片格式')
		}
	}

	function fnError2($obj,content) { //上传格式错误提示
		$obj.append($('<div id="error"><p>' + content + '<br><span>OK</span>' + '</p></div>'))
		setTimeout(function() { //给浏览器渲染个时间
			$('#error p').attr('class', 'active')
		}, 20)
		$('#error span').on('click', function() { //touchend居然不行，这特么不是日狗了吗
			$('#error').remove()
		})
	}

	function fnForm() {
		$('#upload').css('opacity', 0).on('webkitTransitionEnd', function() {
			$(this).attr('class', 'page').css('opacity', 1) //上传页退出
			$(this).off('webkitTransitionEnd') //用完取消事件绑定，不然影响复用
		})
		$('#form').attr('class', 'page showPage') //表单页面出现
		fnGet()
	}

	function fnGet() {
		var tagCh
		$('label span').on('click', function() {
			$('label span').attr('class', '') //清除其他span的样式，模拟单选
			$(this).attr('class', 'active')
			$('#form input[type=button]').attr('class', 'active')
			tagCh = $(this).html()
		})
		$('#form input[type=button]').on('click', function() {
			if ($(this).attr('class')) {
				$('label input[type=radio]').removeAttr('checked') //取消选中为了下次复用
				setTimeout(function() { //用定时器为了美观不至于在过渡期间变色
						$('label span').attr('class', '') //清除样式
					}, 1000)
					//$('input[name=tag]')[]
					//准备用表单上传
				fnJump()
			} else {
				fnError2($('#form'),'请添加标签')
			}
		})
	}

	function fnJump() {
		$('#form').css('opacity', 0).on('webkitTransitionEnd', function() {
			$(this).attr('class', 'page').css('opacity', 1) //表单页消失
		})
		$('#jump').attr('class', 'page showPage') //跳转页面出现
		fnBack()
	}

	function fnBack() {
		$('#jump input').on('click', function() {
			$('#jump').attr('class', 'page') //跳转页消失
			fnHome() //主页出现
		})
	}
}