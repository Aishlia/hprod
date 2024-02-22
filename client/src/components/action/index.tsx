import React, { useEffect, useState } from "react";
import { Box, Text } from "grommet";
import { Link } from "react-router-dom";
import moment from 'moment'
import { Action } from "../../types";
import { socialUrlParser, formatAddress } from "../../utils";
import styled from "styled-components";

export enum ActionType {
  self = 'self',
  other = 'other',
  verified = 'verified',
  none = 'none'
}
const handleActionTypeColor = (type: ActionType, theme: any) => {
  switch (type) {
    case 'verified':
      return `${theme.global.colors.green1}`;
    case 'other':
      return `${theme.global.colors.yellow1}`;
    case 'self':
      return `${theme.global.colors.blue1}`;
    default:
      return `${theme.global.colors.grey1}`;
  }
};

export const handleActionType = (action: Action, walletAddress: string) => {
  // const myAddress = walletAddress ? walletAddress.slice(2) : '';
  if (walletAddress === action.from) {
    return ActionType.self
  } else {
    return ActionType.other
  }
}

export const ActionText = styled(Text) <{ type?: ActionType }>`
  font-size: min(1em, 4vw);
  color: ${(props) => props.type && handleActionTypeColor(props.type, props.theme)};
  cursor: ${(props) => props.type && props.type !== 'none' ? 'pointer' : 'auto'};
`
export const ActionLink = styled(Link) <{ type?: ActionType }>`
  :visited, :link, :hover, :active {
    color: ${(props) => props.type && handleActionTypeColor(props.type, props.theme)};
  }
  font-size: min(1em, 4vw);
  text-decoration: ${(props) => props.type && props.type !== 'none' ? 'underline' : 'none'};
`;

export interface UserActionProps {
  userId?: any
  action: Action
  onTagClicked?: (hashtag: string) => void
  onLocationClicked?: (location: string) => void
}

export const UserAction = (props: UserActionProps) => {
  const { action, userId } = props
  const [actionType, setActionType] = useState<ActionType>(ActionType.none)
  useEffect(() => {
    setActionType(handleActionType(action, userId || ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onTagClicked = () => {
    if (props.onTagClicked && action.payload) {
      if (typeof action.payload === 'string') {
        props.onTagClicked(action.payload);
      } else if ('tag' in action.payload) {
        props.onTagClicked(action.payload.tag);
      }
    }
  }

  const onLocationClicked = (value?: string) => {
    if (props.onLocationClicked && value) {
      props.onLocationClicked(value)
    }
  }

  const address = action.address.short ||
    formatAddress(action.address.road)

  return <Box border={{ side: "bottom", color: 'border' }} pad={"4px 0"}> 
    {(action.type === 'tag' || action.type === 'new_user' || action.type === 'multi_tag') &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          {action.type === 'tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText onClick={onTagClicked} type={actionType}>#{action.payload}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
            </Text>
          }
          {action.type === 'multi_tag' &&
            <Text size={"small"} style={{ wordBreak: 'break-all' }}>
              <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
              {" "}
              <ActionText size={"small"} onClick={onTagClicked} type={actionType}>#{action.payload.tag}</ActionText>
              {" "}
              <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
              {" "}
              ({action.payload.count})
            </Text>
          }
          {action.type === 'new_user' &&
            <ActionText type={ActionType.none}>
              <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
              {" joins"}
            </ActionText>
          }
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}
            size={"small"}>
            {address}
          </Text>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>
    }
    {action.type === 'link' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {/* <ActionText size={"small"} type={ActionType.none}>{socialUrlParser(action.payload || '')[0]?.name}</ActionText>
            {' '} */}
            {' '}
            <ActionLink className="link" to={`/0/${action.from}`} type={actionType}>{
              socialUrlParser(action.payload || '', 'any')?.username
            }
            </ActionLink>
            {' '}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <Text
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}
            size={"small"}>
            {address}
          </Text>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>}
    {action.type === 'location' &&
      <Box direction={'row'} justify={'start'} pad={'0 16px'}>
        <Box basis={address ? "50%" : "90%"}>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <ActionLink className="link" to={`/0/${action.from}`} type={ActionType.none}>0/{action.fromShort}</ActionLink>
            {" "}
            <ActionText size={"small"} onClick={() => onLocationClicked(action.payload)} type={actionType}>{action.payload}</ActionText>
            {" "}
            <ActionLink className="link" to={`/0/${action.to}`} type={ActionType.none}>0/{action.toShort}</ActionLink>
          </Text>
        </Box>
        {address && <Box align={'end'} basis="40%" style={{ minWidth: '32px' }}>
          <ActionText
            onClick={() => onLocationClicked(address)}
            style={{ textAlign: "right", cursor: 'pointer' }}>
            {address}
          </ActionText>
        </Box>}
        <Box align={'end'} basis="10%" style={{ minWidth: '32px' }}>
          <Text size={"xsmall"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>}
  </Box>
}
