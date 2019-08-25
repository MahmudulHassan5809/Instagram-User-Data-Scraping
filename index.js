const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require('fs');


const usernames = [
	'tomhanks',
	'willsmith'
];

(async () => {
	let instagram_data = [];
	for(let username of usernames){

		const BASE_URL = `https://www.instagram.com/${username}`;

		let res = await request(BASE_URL);

		let $ = cheerio.load(res);

		let script = $('script[type="text/javascript"]').eq(3).html();

		let sricptRegex = /window._sharedData = (.+);/g.exec(script);

		let { entry_data : { ProfilePage: { [0] : { graphql : { user }} } } } = JSON.parse(sricptRegex[1]);



		let { entry_data : { ProfilePage: { [0] : { graphql : { user : { edge_owner_to_timeline_media: { edges } } }} } } } = JSON.parse(sricptRegex[1]);

		let posts = [];

		for(let edge of edges){
			let { node } = edge;

			posts.push({
				id : node.id,
				shortCode : node.shortcode,
				timestamp: node.taken_at_timestamp,
				likes: node.edge_liked_by.count,
				comments: node.edge_media_to_comment.count,
				video_views : node.video_view_count,
				caption: node.edge_media_to_caption.edges[0].node.text,
				image_url: node.display_url
			});
		}

		instagram_data.push({
			follwers : user.edge_followed_by.count,
			following: user.edge_follow.count,
			uploads: user.edge_owner_to_timeline_media.count,
			full_name: user.full_name,
			picture_url: user.profile_pic_url_hd,
			posts: posts
		})
	}

	fs.writeFileSync('./data.json',JSON.stringify(instagram_data),'utf-8');
	//console.log(instagram_data);

})()
