import React, { ReactNode, useState, useEffect } from "react";
import { Box, Text } from "grommet";
import { PlainButton } from "../../components/button";
import { useUserContext } from "../../context/UserContext";
import { useParams } from "react-router-dom";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  orderBy,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../configs/firebase-config";
import axios from "axios";

interface HeaderListProps {
  title: string;
  items: Array<{ content: ReactNode }>;
}

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface Message {
  id: string;
  hashtags?: string[];
}

const isValid = (key: string): boolean => {
  const hexRegExp = /^[0-9a-fA-F]+$/;
  return key.length === 40 && hexRegExp.test(key);
};

const isMyPage = (address: string | undefined, key: string): boolean => {
  if (!address) return false;
  return address.substring(2).toLowerCase() === key.toLowerCase();
};

const HeaderList = (props: HeaderListProps) => {
  const { title, items } = props;

  return (
    <Box direction={"row"} gap={"24px"} align={"center"}>
      <Box width={"116px"} align={"center"}>
        <Text size={"164px"} color={"blue1"}>
          {title}
        </Text>
      </Box>
      <Box gap={"8px"}>{items.map((item) => item.content)}</Box>
    </Box>
  );
};

const UserAction = (props: { action: string }) => {
  return (
    <Box border={{ side: "bottom" }} pad={"4px 0"}>
      <Text size={"small"}>{props.action}</Text>
    </Box>
  );
};

const handleSubmit = async (
  event: React.FormEvent,
  wallet: string,
  text: string
) => {
  event.preventDefault();
  console.log(wallet, text)
  let locationData = {
    latitude: null as number | null,
    longitude: null as number | null,
    address: "No location",
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const addressComponents = response.data.address;
          const formattedAddress = {
            house_number: addressComponents.house_number || "",
            road: addressComponents.road || "",
            city:
              addressComponents.city ||
              addressComponents.town ||
              addressComponents.village ||
              "",
            state: addressComponents.state || "",
            postcode: addressComponents.postcode || "",
            country: addressComponents.country || "",
          };
          locationData.latitude = position.coords.latitude;
          locationData.longitude = position.coords.longitude;
          locationData.address = `${formattedAddress.house_number} ${formattedAddress.road}, ${formattedAddress.city}, ${formattedAddress.state}, ${formattedAddress.postcode}, ${formattedAddress.country}`;
        } catch (error) {
          console.error("Error fetching address: ", error);
        } finally {
          await addMessage(locationData, wallet, text);
        }
      },
      async () => {
        // Error callback or when access to location is denied
        await addMessage(locationData, wallet, text);
      }
    );
  } else {
    console.error("Geolocation is not supported by your browser");
    await addMessage(locationData, wallet, text);
  }
};

const addMessage = async (
  locationData: LocationData,
  username: string,
  text: string
) => {
  const timestamp = new Date().toISOString();
  const mentions = [...text.matchAll(/@(\w+)/g)].map((match) => match[1]);
  const hashtags = [...text.matchAll(/#(\w+)/g)].map((match) => match[1]);

  let message = {
    username: username || "Anonymous",
    text,
    timestamp,
    address: locationData.address,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    mentions,
    hashtags,
  };

  // Then add the message to Firestore
  try {
    await addDoc(collection(db, "messages"), message);
  } catch (error) {
    console.error("Could not send the message: ", error);
  }
};

export const UserPage = () => {
  const { wallet } = useUserContext();
  const { key } = useParams();
  const [text, setText] = useState("");

  const linkItems = [
    {
      content: <Text>x/stse</Text>,
    },
    {
      content: <Text>t/stephenstse</Text>,
    },
    {
      content: <Text>g/stephen-tse</Text>,
    },
  ];

  const actions: string[] = [
    "x/stse links Github g/stephen-tse",
    "x/stse links Telegram g/stephentse",
    "g/soph-neou 🤖by x/stse",
  ];

  const [tagItems, setTagItems] = useState<Array<{ content: ReactNode }>>([]);

  useEffect(() => {
    console.log(key)
    const messagesQuery = query(
      collection(db, "messages"),
      where("mentions", "array-contains", key)
    );

    console.log(messagesQuery)

    const unsubscribe = onSnapshot(messagesQuery, (querySnapshot) => {
      const messages: Message[] = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Message[];

      const allHashtags = messages.flatMap((msg) => msg.hashtags || []);
      const hashtagFrequency = allHashtags.reduce<Record<string, number>>(
        (acc, hashtag) => {
          acc[hashtag] = (acc[hashtag] || 0) + 1;
          return acc;
        },
        {}
      );

      const sortedHashtags = Object.entries(hashtagFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([hashtag, count]) => ({
          content: (
            <Box direction={"row"} key={hashtag}>
              <Text>{hashtag}</Text>
              <Text size={"xsmall"}>{count}</Text>
            </Box>
          ),
        }));

      console.log(sortedHashtags)

      setTagItems(sortedHashtags);
    });

    return () => unsubscribe();
  }, []);

  if (!key || !isValid(key)) {
    return <Box>Not a valid user ID</Box>;
  }

  return (
    <Box>
      <Box>
        <HeaderList title={"/"} items={linkItems} />
        <HeaderList title={"#"} items={tagItems} />
      </Box>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (wallet !== undefined) {
            const addressWithoutPrefix = wallet.address.slice(2);
            handleSubmit(e, addressWithoutPrefix, text + ' @' + key);
          } else {
            console.log("Invalid user wallet");
          }
        }}
      >
        <div className="input-with-icon">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text here"
          />
        </div>
      </form>
      <Box>
        <Box direction={"row"} gap={"16px"}>
          <PlainButton>All(91)</PlainButton>
          <PlainButton>@stse(12)</PlainButton>
        </Box>
      </Box>
      <Box margin={{ top: "16px" }} gap={"4px"}>
        {actions.map((action) => {
          return <UserAction key={action} action={action} />;
        })}
      </Box>
    </Box>
  );
};
