const ejs = require('ejs')

const tpl = `
<xml>
	<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
	<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
	<CreateTime><%= createTime %></CreateTime>
	<% if (msgType === 'text') { %>
		<MsgType><![CDATA[text]]></MsgType>
		<Content><![CDATA[<%= content %>]]></Content>
	<% } else if (msgType === 'image') { %>
		<MsgType><![CDATA[image]]></MsgType>
		<PicUrl><![CDATA[<%= content.picUrl %>]]></PicUrl>
		<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
	<% } else if (msgType === 'voice') { %>
		<MsgType><![CDATA[voice]]></MsgType>
		<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
		<Format><![CDATA[<%= content.format %>]]></Format>
	<% } else if (msgType === 'video') { %>
		<MsgType><![CDATA[video]]></MsgType>
		<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
		<ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
	<% } else if (msgType === 'shortvideo') { %>
		<MsgType><![CDATA[shortvideo]]></MsgType>
		<MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
		<ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
	<% } else if (msgType === 'location') { %>
		<MsgType><![CDATA[location]]></MsgType>
		<Location_X><%= content.locationX %></Location_X>
		<Location_Y><%= content.locationY %></Location_Y>
		<Scale><%= content.scale %></Scale>
		<Label><![CDATA[<%= content.label %>]]></Label>
	<% } else if (msgType === 'link') { %>
		<MsgType><![CDATA[link]]></MsgType>
		<Title><![CDATA[<%= content.title %>]]></Title>
		<Description><![CDATA[<%= content.description %>]]></Description>
		<Url><![CDATA[<%= content.url %>]]></Url>
	<% } %>
	<MsgId><%= msgId %></MsgId>
</xml>
`

const compile = ejs.compile(tpl)

module.exports = compile