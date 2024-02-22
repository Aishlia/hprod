import React from "react";
import { Box, Spinner, Text } from "grommet";
import styled from "styled-components";
import { StarOutlined } from "@ant-design/icons"; // FireOutlined, HeartOutlined,

import { useActionsContext } from "../../context";
import { UserAction } from "../../components/action";
import { isValidAddress } from "../../utils/user";
import { useUserContext } from "../../context";

import { HeaderList } from "./headerList";
import { PlainButton, PlainText } from "../../components/button";
import { useIsUserPage, useTopTags, useUrls } from "./hooks";

const UserPageBox = styled(Box)`
  .filter-panel {
    margin-top: 10px;
    margin-bottom: 5px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: center;
  }
`;

export const UserPage = (props: { id: string }) => {
  const { wallet } = useUserContext();
  const { id: key } = props;

  const tagItems = useTopTags();
  const extendedUrls = useUrls();
  const isUserPage = useIsUserPage();

  const {
    actions,
    filters,
    setFilters,
    filterMode,
    setFilterMode,
    DefaultFilterMode,
    isLoading,
  } = useActionsContext();

  if (!key || !isValidAddress(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  const onTagClicked = (hashtag: string) => {
    if (!filters.find((item) => item.value === hashtag)) {
      setFilters([
        ...filters,
        {
          type: "hashtag",
          value: hashtag,
        },
      ]);
      setFilterMode("hashtag");
    }
  };

  const onLocationClicked = (location: string) => {
    if (!filters.find((item) => item.value === location)) {
      setFilters([
        ...filters,
        {
          type: "location",
          value: location,
        },
      ]);
      setFilterMode("location");
    }
  };

  const headerListProps = {
    userId: key,
    isLoading,
    isUserPage,
    wallet,
  };
  return (
    <UserPageBox>
      <Box gap={"16px"} pad={"0 16px"}>
        <HeaderList {...headerListProps} type={"url"} items={extendedUrls} />
        <HeaderList {...headerListProps} type={"hashtag"} items={tagItems} />
      </Box>
      <div className="filter-panel">
        <Box direction={"row"}>
          <PlainButton
            isActive={filterMode === "all"}
            onClick={() => setFilterMode("all")}
          >
            <PlainText fontSize="min(1em, 4vw)">all</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "address"}
            onClick={() => setFilterMode("address")}
          >
            <PlainText
              fontSize="min(1em, 4vw)"
            >
              {key?.substring(0, 4)}
            </PlainText>
          </PlainButton>
          {filters
            .filter((f) => f.value !== "one" && f.value !== "ai")
            .map((filter) => {
              const { value } = filter;
              const onClick = () => {
                const newFilters = filters.filter(
                  (item) => item.value !== value
                );
                setFilters(newFilters);
                if (newFilters.length === 0) {
                  setFilterMode(DefaultFilterMode);
                }
              };
              return (
                <PlainButton
                  key={value}
                  isActive={filters.length > 0}
                  onClick={onClick}
                >
                  <PlainText color={isUserPage ? "blue1" : "yellow1"}>
                    #{value}
                  </PlainText>
                </PlainButton>
              );
            })}
        </Box>
        <Box direction={"row"} alignSelf="center" alignContent="around">
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "one")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "one"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "one",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            <PlainText fontSize="min(1em, 4vw)">#one</PlainText>
          </PlainButton>
          <PlainButton
            isActive={filterMode === "hashtag"}
            onClick={() => {
              if (filters.find((item) => item.value === "ai")) {
                const newFilters = filters.filter(
                  (item) => item.value !== "ai"
                );
                setFilters(newFilters);
              } else {
                setFilters([
                  ...filters,
                  {
                    type: "location",
                    value: "ai",
                  },
                ]);
                setFilterMode("hashtag");
              }
            }}
          >
            <PlainText fontSize="min(1em, 4vw)">#ai</PlainText>
          </PlainButton>
          <PlainButton style={{ padding: '2px' }}>
            <PlainText fontSize="min(1em, 4vw)">
              <StarOutlined />
            </PlainText>
          </PlainButton>
        </Box>
      </div>
      <Box>
        {isLoading && (
          <Box align={"center"}>
            <Spinner color={"spinner"} />
          </Box>
        )}
        {!isLoading && actions.length === 0 && (
          <Box align={"center"}>
            <Text color='grey1'>No actions found</Text>
          </Box>
        )}
        {!isLoading &&
          actions.map((action, index) => (
            <UserAction
              userId={key}
              key={index + action.timestamp}
              action={action}
              onTagClicked={onTagClicked}
              onLocationClicked={onLocationClicked}
            />
          ))}
      </Box>
    </UserPageBox>
  );
};
