var examples = [
	{
		key: 'basic',
		name: '基础',
		children: [
			{
				name: 'load an image',
				state: 'basicLoadAnImage'
			},
			{
				name: 'click on an image',
				state: 'basicClickOnAnImageState'
			},
			{
				name: 'move an image',
				state: 'basicMoveAnImageState'
			},
			{
				name: 'image follow input',
				state: 'basicImageFollowInputState'
			},
			{
				name: 'load an animation',
				state: 'basicLoadAnAnimationState'
			},
			{
				name: 'render text',
				state: 'basicRenderTextState'
			},
			{
				name: 'tween an image',
				state: 'basicTweenAnImageState'
			}
		]
	},
	{
		key: 'game',
		name: '游戏',
		children: [
			{
				name: 'plane',
				state: 'planePreload'
			}
		]
	},
	{
		key: 'open',
		name: '开放域',
		children: [
			{
				name: 'show open canvas',
				state: 'openShowOpenCanvas'
			},
			{
				name: 'set your score',
				state: 'openSetCloudScore'
			},
			{
				name: 'get your score',
				state: 'openGetCloudScore'
			},
			{
				name: 'get friend score',
				state: 'openGetFriendCloudScore'
			},
			{
				name: 'show ranking list',
				state: 'openShowRankingList'
			}
		]
	}
];

export default examples;
