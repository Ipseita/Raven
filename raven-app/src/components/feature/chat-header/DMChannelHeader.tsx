import { PageHeader } from "@/components/layout/Heading/PageHeader"
import { useIsUserActive } from "@/hooks/useIsUserActive"
import { DMChannelListItem } from "@/utils/channel/ChannelListProvider"
import { ChannelMembers } from "@/utils/channel/ChannelMembersProvider"
import { SearchButton } from "./SearchButton"
import { Badge, Flex, Heading } from "@radix-ui/themes"
import { UserAvatar } from "@/components/common/UserAvatar"
import { ViewFilesButton } from "../files/ViewFilesButton"
import { useMemo } from "react"

interface DMChannelHeaderProps {
    channelData: DMChannelListItem,
    channelMembers: ChannelMembers
}

export const DMChannelHeader = ({ channelData, channelMembers }: DMChannelHeaderProps) => {

    // There are two people in a DM channel, the user (you) and the peer (the other person)
    // If channelData.is_self_message is 1, then the user is having a conversation with themself

    const peer = channelData.peer_user_id
    const isActive = useIsUserActive(channelData.peer_user_id)

    const { isBot, fullName, userImage } = useMemo(() => {

        const peerUserData = channelMembers?.[peer]

        const isBot = peerUserData?.type === 'Bot'

        return {
            fullName: peerUserData?.full_name ?? peer,
            userImage: peerUserData?.user_image ?? '',
            isBot
        }

    }, [channelMembers, peer])

    return (
        <PageHeader>
            <Flex gap='3' align='center'>
                <UserAvatar
                    key={peer}
                    alt={fullName}
                    src={userImage}
                    isActive={isActive}
                    skeletonSize='6'
                    isBot={isBot}
                    size='2' />
                <Heading size='5'>
                    <div className="flex items-center gap-2">
                        {fullName} {isBot && <Badge color='gray' className='font-semibold px-1.5 py-0.5'>Bot</Badge>}
                    </div>
                </Heading>
            </Flex>
            <Flex gap='2'>
                <ViewFilesButton />
                <SearchButton />
            </Flex>
        </PageHeader>
    )
}