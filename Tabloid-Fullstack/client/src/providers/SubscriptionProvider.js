import React, { useState, createContext, useContext } from "react";
import { UserProfileContext } from "../providers/UserProfileProvider";

export const SubscriptionContext = createContext();

export function SubscriptionProvider(props) {
  const apiUrl = "/api/subscription";

  const { getToken } = useContext(UserProfileContext);
  const [subs, setSubs] = useState([]);
  const [hasSubs, setHasSubs] = useState([]);
  const userProfile = JSON.parse(localStorage.getItem('userProfile'));


  const getSubsByUser = () => {
    const userProfileId = JSON.parse(localStorage.getItem('userProfile')).id;
    getToken().then((token) =>
      fetch(`${apiUrl}/getsubs/${userProfileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((subs) => {
          const activeSubs = subs.filter(sub => sub.endDateTime === "9999-12-31T23:59:59.997")
          setSubs(activeSubs);
        })
    );
  };

  const checkIfSubs = () => {
    if (userProfile) {
      const userProfileId = JSON.parse(localStorage.getItem('userProfile')).id;
      getToken().then((token) =>
        fetch(`${apiUrl}/getbyuser/${userProfileId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((res) => {
            const activeSubs = res.filter(sub => sub.endDateTime === "9999-12-31T23:59:59.997");
            if (activeSubs.length >= 1) {
              setHasSubs(true)
              return true
            } else {
              setHasSubs(false)
              return false
            }
          })

      );
    } else {
      setHasSubs(false)
      return false
    }

  };

  const addSub = (post) => {
    const userProfileId = JSON.parse(localStorage.getItem('userProfile')).id;
    const providerUserProfileId = post.userProfileId;
    const subscriberUserProfileId = userProfileId;
    const sub = {
      subscriberUserProfileId,
      providerUserProfileId
    }
    getToken().then((token) =>
      fetch(`${apiUrl}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sub),
      }).then(getSubsByUser)
    );
  };

  const updateSub = (sub) => {
    getToken().then((token) =>
      fetch(`${apiUrl}/${sub.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sub),
      }
      )
    ).then(getSubsByUser);
  };

  return (
    <SubscriptionContext.Provider
      value={{
        getSubsByUser,
        subs,
        setSubs,
        addSub,
        updateSub,
        checkIfSubs,
        hasSubs,
        setHasSubs
      }}
    >
      {props.children}
    </SubscriptionContext.Provider>
  );
}