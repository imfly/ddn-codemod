/**
 * 说明：本文件仅作为测试，没有实际意义。
 * 
 * Created At: Saturday, 25th September 2021 8:26:02 am By imfly (kubying@qq.com>)
 * Created By imfly (kubying@qq.com>)
 * 
 * Copyright（c) 2021 DATM FOUNDATION
 */

import React from "react"
import { Component } from "react"
import { View, ViewStyle, ScrollView, Text, StatusBar, SafeAreaView, TextStyle, TouchableOpacity, Image, RefreshControl, Dimensions, Clipboard, ImageStyle, ColorPropType, NativeModules } from "react-native"

const hardLevelScope = [
	{ name: "简单", value: "simple" },
	{ name: "中等", value: "medium" },
	{ name: "困难", value: "hard" },
]
const width = Dimensions.get("window").width

const UShare = NativeModules.UMShareModule

const FULL: ViewStyle = { flex: 1 }

const HEAD_BUTTON: ViewStyle = {
	width: 30,
	height: 30,
	padding: 5,
	marginRight: 15,
	borderRadius: 15,
}
const CONTAINER: ViewStyle = {
	...FULL,
	backgroundColor: color.screen,
}

const CONTENT_WRAP: ViewStyle = {
	backgroundColor: color.textLight,
	borderTopLeftRadius: 20,
	borderTopRightRadius: 20,
	shadowColor: color.darkBackground,
	shadowOffset: {
		width: 20,
		height: 20,
	},
	borderWidth: 1,
	borderColor: color.border
}

const TEXTINPUTLAYOUT: ViewStyle = {
	flexDirection: "row",
	justifyContent: "flex-start",
	borderColor: "#f7f7f7",
	borderWidth: 1,
	padding: 10,
	backgroundColor: color.background,
	marginTop: 10,
	alignItems: "center",
}

const BELOG_STYLE: ViewStyle = {
	flexDirection: "row",
	alignItems: "flex-start",
}

const BELOG_NAME: TextStyle = {
	color: color.textDark,
	marginLeft: 8,
}
const BELOG_FROM: TextStyle = {
	fontSize: 14,
	color: color.textDark,
	marginLeft: 8,
	marginRight: 8,
}

const COMMUNITYNAME: TextStyle = {
	fontSize: 14,
	color: color.blueText,
	marginLeft: 8,
}

const SUBMIT_TITLE: TextStyle = {
	fontSize: 15,
	color: color.textDark,
}

const FINISH_STATUS: TextStyle = {
	...SUBMIT_TITLE,
	paddingVertical: 10,
	flex: 1,
}

const WORKER_NAME: TextStyle = {
	marginLeft: 20
}

const ACTIVE_TEXT: TextStyle = {
	fontSize: 16,
	margin: 7,
	color: color.redEnvelope,
}

const SUBMISSION_RIGHT_BOX: ViewStyle = {
	...ACTIVE_TEXT,
	flexDirection: "row",
	justifyContent: "flex-end"
}

@inject("userInforStore")
@observer
export class BountyDetailScreen extends Component<BountyDetailScreenProps, state> {
	static navigationOptions = ({ navigation }: { navigation: { getParam: Function } }) => {
		return {
			headerTitle: "悬赏详情",
			headerRight: (
				<TouchableOpacity onPress={navigation.getParam("showShareOperation")} style={HEAD_BUTTON}>
					<SimpleIcon name="share-alt" size={18} color={color.textLight} />
				</TouchableOpacity>
			),
		}
	}

	// 获取悬赏留言
	getComments = async (type: "loading" | "refresh" = "loading") => {
		try {
			const { words, page } = this.state
			const bountyId = this.props.navigation.getParam("id")
			const resetPage = type === "loading" ? page : 1
			const resetWords = type === "loading" ? words : []
			if (!bountyId) return Toast.fail("服务异常，请退出重试", 1, undefined, false)
			// code
		} catch (error) {
			this.setState({ refreshing: false })
			Toast.fail(error.message)
		}
	}

	// 上拉加载
	onEndReached = () => {
		const { refreshing, wordsListCount, wordsCount } = this.state
		if (refreshing) return Toast.info("正在加载...", 1, undefined, false)
		if (wordsListCount < wordsCount) {
			this.getComments()
		}
	}

	renderSubmission = (item: bountySubmission) => {
		const { bountyDetail } = this.state
		return <List.Item
			key={item._id}
			thumb={<CustomAvatar size={28} source={item.user && item.user.photoUrl} />}
			arrow={item.status === "grade" ? "horizontal" : ""}
			extra={
				<View>
					{item.status === "doing" &&
						<View style={SUBMISSION_RIGHT_BOX}>
							<Text style={ACTIVE_TEXT}>进行中</Text>
						</View>
					}
				</View>
			}>
			<Text style={WORKER_NAME}>{item.user && item.user.name}</Text>
		</List.Item>
	}

	render() {
		return (
			<View style={FULL}>
				<StatusBar barStyle="light-content" backgroundColor={color.palette.headerColor} />
				<SafeAreaView style={FULL}>
					<ScrollView
						style={CONTAINER}
						showsVerticalScrollIndicator={false}
						showsHorizontalScrollIndicator={false}
						onScrollEndDrag={this.onEndReached}
						refreshControl={<RefreshControl
							colors={[color.primary]}
							onRefresh={this.onRefresh}
							refreshing={refreshing}
						/>}
					>
						<View style={CONTENT_WRAP}>
							<View style={{ margin: 7 }}>
								<View style={BELOG_STYLE}>
									<CustomAvatar
										size={24}
										defaultSource={require("~/assets/images/default-person.png")}
										source={bountyDetail.user && bountyDetail.user.photoUrl} />
									<Text style={BELOG_NAME}>{bountyDetail.user && bountyDetail.user.name}</Text>
									<Text style={BELOG_FROM}>来自</Text>
									<Text style={COMMUNITYNAME}>{bountyDetail.community && bountyDetail.community.name} </Text>
								</View>
							</View>
						</View>
					</ScrollView>
				</SafeAreaView>
				<View BBstyle={[TEXTINPUTLAYOUT, FINISH_STATUS]}>
					<BountyComment
						bountyDetail={bountyDetail}
					/>
				</View>
				<TouchableOpacity onPress={this.editIntro}>
					<View style={styles.margint_7}>
						<Text numberOfLines={2} style={[COMMUNITYNAME, { paddingRight: 10, lineHeight: 25 }]}>
							{bounty.content ? bounty.content : <Text style={[COMMUNITYNAME, { color: "#1D1D1D33" }]}>请填写悬赏描述</Text>}
						</Text>
					</View>
				</TouchableOpacity>
			</View >
		)
	}
}

