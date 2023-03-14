import { type NextPage } from "next";
import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import Navbar from "../../../components/navbar/Navbar";
import { signIn, signOut, useSession } from "next-auth/react";
import Button, { ColorOptions } from "../../../components/buttons/Button";
import { useRouter } from "next/router";

import { api } from "../../../utils/api";
import { contextProps } from "@trpc/react-query/shared";

import { Listbox, Transition } from "@headlessui/react";
import Dialog from "./../../../components/dialogs/Dialog";
import Container from "../../../components/annonse/Container";
import Swiper from "../../../components/swiper/Swiper";

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

  const { data: author } = api.profile.getUser.useQuery(
    {
      id: advert?.authorId as string,
    },
    {
      enabled: !!advert?.authorId,
    }
  );

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
          <div className="flex w-full flex-row gap-4">
            <Swiper></Swiper>
            <div className="flex flex-col gap-3">
              <div className="flex h-[10rem] w-[16rem] flex-col gap-1 rounded-md bg-gray-100 p-4">
                <p className="font-semibold text-emerald-700">
                  {advert?.subCategoryName}
                </p>
                <p className="mb-3 text-3xl font-semibold text-black">
                  {advert?.price} NOK
                </p>
                <Button
                  text="Lei ut"
                  color={ColorOptions.black}
                  onClick={() =>
                    void router.push(
                      id ? `/annonser/lei-ut/${id as string}/` : "/"
                    )
                  }
                />
              </div>
              <div className="flex h-[6rem] w-[16rem] flex-row items-center gap-3 rounded-md bg-gray-100 p-4">
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
                  <p>
                    {author?.totalRatingpoints
                      ? (
                          Math.round(
                            (author.totalRatingpoints / author.totalRatings) *
                              100
                          ) / 100
                        ).toString() +
                        "/6 (" +
                        author.totalRatings.toString() +
                        " rangeringer)"
                      : "Ikke fått noen ratinger"}
                  </p>
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
