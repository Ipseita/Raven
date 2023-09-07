import { Text, Box, HStack, Stack, useColorMode, Center, Image, Icon, IconButton, StackDivider, LinkBox } from '@chakra-ui/react'
import { Message } from '../../../../../../types/Messaging/Message'
import { MarkdownRenderer } from '../../markdown-viewer/MarkdownRenderer'
import { DateObjectToFormattedDateStringWithoutYear, DateObjectToTimeString, getFileExtension, getFileName } from '../../../../utils/operations'
import { getFileExtensionIcon } from '../../../../utils/layout/fileExtensionIcon'
import { IoMdClose } from 'react-icons/io'
import { useFrappeGetDoc } from 'frappe-react-sdk'
import { AlertBanner } from '../../../layout/AlertBanner'
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ChannelListItem, DMChannelListItem } from '@/utils/channel/ChannelListProvider'
import { UserFields } from '@/utils/users/UserListProvider'
import { useGetUserRecords } from '@/hooks/useGetUserRecords'
import { RavenMessage } from '@/types/RavenMessaging/RavenMessage'

interface PreviousMessageBoxProps {
    previous_message_id?: string,
    previous_message_content?: Message,
    onReplyingToMessageClose?: () => void,
    channelData: ChannelListItem | DMChannelListItem,
}

const MAX_TRUNCATED_LENGTH = 100

export const PreviousMessageBox = ({ previous_message_id, previous_message_content, onReplyingToMessageClose, channelData }: PreviousMessageBoxProps) => {

    const users = useGetUserRecords()
    const { colorMode } = useColorMode()

    if (previous_message_content) {
        return (
            <Box m='2' bgColor={colorMode === 'light' ? 'gray.50' : 'black'} rounded={'md'}>
                <HStack w='full' p='2' rounded='md' justify="space-between">

                    <Stack spacing={1}>
                        <HStack divider={<StackDivider />}>
                            <Text fontSize='sm' fontWeight={'semibold'}>{users?.[previous_message_content.owner]?.full_name ?? previous_message_content.owner}</Text>
                            <HStack spacing={1}>
                                <Text fontSize='xs' color='gray.500'>{DateObjectToFormattedDateStringWithoutYear(new Date(previous_message_content.creation))}</Text>
                                <Text fontSize='xs' color='gray.500'>at</Text>
                                <Text fontSize='xs' color='gray.500'>{DateObjectToTimeString(new Date(previous_message_content.creation))}</Text>
                            </HStack>
                        </HStack>
                        {/* message content */}
                        {previous_message_content.message_type === 'Text' &&
                            <HStack spacing={0}>
                                <Stack>
                                    <MarkdownRenderer content={previous_message_content.text.slice(0, MAX_TRUNCATED_LENGTH)} />
                                </Stack>
                                {previous_message_content.text.length > MAX_TRUNCATED_LENGTH && <Text as="span" fontSize="sm">...</Text>}
                            </HStack>
                        }
                        {(previous_message_content.message_type === 'Image' || previous_message_content.message_type === 'File') &&
                            <HStack justify={'flex-start'}>
                                <Center maxW='50px'>
                                    {previous_message_content.message_type === 'Image' ?
                                        <Image src={previous_message_content.file} alt='File preview' boxSize={'30px'} rounded='md' /> :
                                        <Icon as={getFileExtensionIcon(getFileExtension(previous_message_content.file) ?? '')} boxSize="4" />}
                                </Center>
                                <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{getFileName(previous_message_content.file)}</Text>
                            </HStack>
                        }
                    </Stack>

                    <IconButton
                        onClick={onReplyingToMessageClose}
                        size="sm"
                        title='Remove message'
                        variant="ghost"
                        icon={<IoMdClose />}
                        aria-label="Remove message" />

                </HStack>
            </Box>
        )
    }

    if (previous_message_id) return <PreviousMessageBoxInChat
        previous_message_id={previous_message_id}
        users={users} />

    return null
}

interface PreviousMessageBoxInChatProps {
    previous_message_id: string,
    users: Record<string, UserFields>
}

const PreviousMessageBoxInChat = ({ previous_message_id, users }: PreviousMessageBoxInChatProps) => {

    const { colorMode } = useColorMode()
    const { data, error } = useFrappeGetDoc<RavenMessage>('Raven Message', previous_message_id)

    const { channelID } = useParams()
    const navigate = useNavigate()
    const { hash } = useLocation()

    const scrollToMessage = () => {
        const channel = data?.channel_id
        const messageID = data?.name
        if (channel && messageID) {
            const hashID = hash?.replace('#message-', '')
            if (channelID === channel && hashID === messageID) {
                document.getElementById(`message-${messageID}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            } else {
                navigate(`/channel/${channel}#message-${messageID}`)
            }
        }
    }

    if (error) {
        return <AlertBanner status='error' heading='previous message not found, this message may have been deleted' />
    }
    if (data) {
        return <LinkBox onClick={scrollToMessage} p='2' border={'1px'} borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'} rounded={'md'} _hover={{ cursor: 'pointer', boxShadow: 'sm', bgColor: colorMode === 'light' ? 'white' : 'black' }}>
            <Box pl='2' borderLeft={'2px'} borderLeftColor={colorMode === 'light' ? 'gray.600' : 'gray.600'}>
                <Stack spacing={1}>
                    <HStack>
                        <Text fontSize='xs' fontWeight={'semibold'} color='blue.500'>{users?.[data.owner]?.full_name ?? data.owner}</Text>
                        <HStack spacing={1}>
                            <Text fontSize='2xs' color='gray.500'>{DateObjectToFormattedDateStringWithoutYear(new Date(data.creation))}</Text>
                            <Text fontSize='2xs' color='gray.500'>at</Text>
                            <Text fontSize='2xs' color='gray.500'>{DateObjectToTimeString(new Date(data.creation))}</Text>
                        </HStack>
                    </HStack>
                    {/* message content */}
                    {data.message_type === 'Text' && data.text &&
                        <HStack spacing={0}>
                            <Stack>
                                <MarkdownRenderer content={data.text?.slice(0, MAX_TRUNCATED_LENGTH) ?? ''} />
                            </Stack>
                            {data.text?.length > MAX_TRUNCATED_LENGTH && <Text as="span" fontSize="sm">...</Text>}
                        </HStack>
                    }
                    {(data.message_type === 'Image' || data.message_type === 'File') &&
                        <HStack justify={'flex-start'}>
                            <Center maxW='50px'>
                                {data.message_type === 'Image' ?
                                    <Image src={data.file} alt='File preview' boxSize={'30px'} rounded='md' /> :
                                    <Icon as={getFileExtensionIcon(getFileExtension(data.file ?? '') ?? '')} boxSize="4" />}
                            </Center>
                            <Text as="span" fontSize="sm" overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis">{getFileName(data.file ?? '')}</Text>
                        </HStack>
                    }
                </Stack>
            </Box>
        </LinkBox>
    }

    return null
}