import React from "react";
import {Box, Text} from "grommet";
import {Link} from "react-router-dom";
import moment from 'moment'
import {Action} from "../../types";

export const UserAction = (props: { action: Action }) => {
  const { action } = props

  return <Box border={{ side: "bottom" }} pad={"4px 0"}>
    {action.type === "new_user" ?
      (<Text size={"small"}>
        <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
        {" joins"}
      </Text>)
      :
      <Box direction={'row'} justify={'between'}>
        <Box>
          <Text size={"small"} style={{ wordBreak: 'break-all' }}>
            <Link className="link" to={`/0/${action.from}`}>0/{action.fromShort}</Link>
            {" tags #"}
            {action.payload}
            {" on "}
            <Link className="link" to={`/0/${action.to}`}>0/{action.toShort}</Link>
          </Text>
        </Box>
        <Box align={'end'} style={{ minWidth: '32px' }}>
          <Text size={"small"}>
            {moment(action.timestamp).fromNow()}
          </Text>
        </Box>
      </Box>
    }
  </Box>
}
