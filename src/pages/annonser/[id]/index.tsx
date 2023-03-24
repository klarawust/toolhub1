import { type NextPage } from "next";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../../../components/navbar/Navbar";
import { signIn, signOut, useSession } from "next-auth/react";
import Button, {
  ColorOptions,
  IconOptions,
} from "../../../components/buttons/Button";
import { useRouter } from "next/router";

import { api } from "../../../utils/api";
import { contextProps } from "@trpc/react-query/shared";

import { Listbox, Transition } from "@headlessui/react";
import Dialog from "./../../../components/dialogs/Dialog";
import Container from "../../../components/annonse/Container";
import Swiper from "../../../components/swiper/Swiper";
import { HeartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Rating } from "@mui/material";

const NyAnnonse: NextPage = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();
  const ctx = api.useContext();

  // get id from nextjs router
  const { id } = router.query;

  // get advert by id
  const { data: advert } = api.advertisement.getOne.useQuery(
    {
      id: id as string,
    },
    {
      enabled: !!id,
    }
  );

  const { data: favoritedAd } = api.favorite.getFavoritedAd.useQuery(
    {
      advertId: id as string,
    },
    {
      enabled: !!id,
    }
  );

  const { data: author } = api.profile.getUser.useQuery(
    {
      id: advert?.authorId as string,
    },
    {
      enabled: !!advert?.authorId,
    }
  );

  const { data: ratings } = api.rating.getRatings.useQuery({
    id: author?.id as string,
  });

  const { mutate: favoriteAdvert } = api.favorite.favoriteAd.useMutation({
    onSuccess: (data) => {
      ctx.favorite
        .invalidate()
        .then(() => {
          setFavorited(true);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  });

  const { mutate: unfavoriteAdvert } = api.favorite.unfavoriteAd.useMutation({
    onSuccess: (data) => {
      ctx.favorite
        .invalidate()
        .then(() => {
          setFavorited(false);
        })
        .catch((err) => {
          console.log(err);
        });
    },
  });

  const handleFavorite = () => {
    if (!favorited) {
      favoriteAdvert({
        advertId: id as string,
      });
    } else {
      unfavoriteAdvert({
        advertId: id as string,
      });
    }
  };

  let ratingTotal = 0;
  let averageRating = 0;
  let amountOfRatings = 0;

  useEffect(() => {
    ratingTotal = 0;
    amountOfRatings = 0;
    if (ratings) {
      ratings.forEach((r) => {
        ratingTotal += r.rating;
        amountOfRatings++;
      });
    }
    averageRating = ratingTotal / amountOfRatings;
    console.log(averageRating);
    console.log(ratings);
    document.getElementById("averageRating")!.innerHTML =
      (Math.round(averageRating * 10) / 10).toFixed(1) +
      "/5 basert på " +
      amountOfRatings +
      " vurderinger";
    if (amountOfRatings == 1) {
      document.getElementById("averageRating")!.innerHTML =
        (Math.round(averageRating * 10) / 10).toFixed(1) +
        "/5 basert på 1 vurdering";
    }
    if (!averageRating) {
      document.getElementById("averageRating")!.innerHTML =
        "Ingen vurderinger enda";
    }
  }, [ratings]);

  useEffect(() => {
    if (favoritedAd) {
      if (favoritedAd.length > 0) {
        setFavorited(true);
      } else {
        setFavorited(false);
      }
    }
  }, [favoritedAd]);

  const [favorited, setFavorited] = useState<undefined | boolean>(undefined);

  return (
    <>
      <Head>
        <title>Toolhub | Annonser</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-[120px] flex h-screen flex-col items-center justify-end overflow-hidden bg-gray-100">
        <Navbar />
        <Container title={advert ? advert.title : "Fant ikke annonse"}>
          {favorited != undefined ? (
            <div className="mt-[-3.5rem] mb-8 flex flex-row justify-center self-end">
              <p className="mr-2 mt-1">Legg til som favoritt</p>
              {favorited ? (
                <div
                  className="gap-2 rounded-md bg-rose-500 p-2 text-white hover:cursor-pointer "
                  onClick={() => handleFavorite()}
                >
                  <HeartIcon className="h-5 w-5" strokeWidth={2} />
                </div>
              ) : (
                <div
                  className="gap-2 rounded-md bg-gray-100 p-2 text-rose-500 hover:cursor-pointer hover:text-rose-500"
                  onClick={() => handleFavorite()}
                >
                  <HeartIcon className="h-5 w-5" strokeWidth={2} />
                </div>
              )}
            </div>
          ) : null}
          <div className="flex w-full flex-row gap-4">
            <div className="flex max-h-72 flex-col overflow-hidden">
              <Image
                src={"/images/" + advert?.image}
                width="400"
                height="300"
                alt={""}
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex h-[10rem] w-[20rem] flex-col gap-1 rounded-md bg-gray-100 p-4">
                <p className="flex flex-row justify-between font-semibold text-emerald-700">
                  {advert?.subCategoryName}{" "}
                </p>
                <p className="mb-3 text-3xl font-semibold text-black">
                  {advert?.price} NOK
                </p>
                <Button
                  text={
                    sessionData?.user.id != advert?.authorId
                      ? "Lei ut"
                      : "Din annonse"
                  }
                  color={ColorOptions.black}
                  onClick={() =>
                    sessionData?.user.id != advert?.authorId
                      ? void router.push(
                          id ? `/annonser/lei-ut/${id as string}/` : "/"
                        )
                      : console.log("Can't rent your own ad")
                  }
                />
              </div>
              <div className="flex h-[7rem] w-[20rem] flex-row items-center gap-3 rounded-md bg-gray-100 p-4">
                <div className="h-[2.5rem] w-[2.5rem] rounded-full bg-black"></div>
                <div className="flex flex-col">
                  <p
                    className="cursor-pointer text-green-700"
                    onClick={() =>
                      void router.push(author ? `/profil/${author.id}` : "/")
                    }
                  >
                    {author?.name}
                  </p>
                  <p>{author?.phone ? author.phone : "Mangler tlf"}</p>
                  <p id="averageRating">Ikke fått noen ratinger</p>
                </div>
              </div>
            </div>
          </div>
          <h3 className="text-md mt-5 mb-2 w-full font-sofia font-semibold">
            Beskrivelse
          </h3>
          <p className="h-[20rem] w-full overflow-y-scroll font-warming text-[1rem] font-light">
            {advert?.description}
          </p>
        </Container>
      </main>
    </>
  );
};

export default NyAnnonse;
