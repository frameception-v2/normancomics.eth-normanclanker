"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE, NRMN_TOKEN_ADDRESS, UNISWAP_POOL_URL, CLANKER_URL, SHARE_TEXT } from "~/lib/constants";

function ClankerCard() {
  const handleBuy = useCallback(() => {
    sdk.actions.openUrl(UNISWAP_POOL_URL);
  }, []);

  const handleViewPool = useCallback(() => {
    sdk.actions.openUrl(UNISWAP_POOL_URL);
  }, []);

  const handleViewOriginal = useCallback(() => {
    sdk.actions.openUrl(CLANKER_URL);
  }, []);

  const handleShare = useCallback(() => {
    sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_TEXT)}`);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🦖 NORMANCLANKER</CardTitle>
        <CardDescription className="text-base">
          $NRMN - NormanComics Hi-Tech Internet Funny Monies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button className="w-full" onClick={handleBuy}>
            🚀 Buy $NRMN (Base Chain)
          </Button>
          <Button className="w-full" onClick={handleViewPool}>
            📊 View $NRMN/$wETH UNIv3 Pool
          </Button>
        </div>
        
        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={handleViewOriginal}>
            🔍 View Original Clanker Post
          </Button>
          <Button variant="outline" className="w-full" onClick={handleShare}>
            📢 Share Frame (IM BUYING $NRMN)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <Label>Token Address:</Label>
          <p className="break-all">{NRMN_TOKEN_ADDRESS}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();

  const [added, setAdded] = useState(false);
  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      await sdk.actions.addFrame();
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) {
        return;
      }

      setContext(context);
      setAdded(context.client.added);

      if (!context.client.added) {
        addFrame();
      }

      sdk.on("frameAdded", ({ notificationDetails }) => {
        setAdded(true);
      });

      sdk.on("frameAddRejected", ({ reason }) => {
        console.log("frameAddRejected", reason);
      });

      sdk.on("frameRemoved", () => {
        console.log("frameRemoved");
        setAdded(false);
      });

      sdk.actions.ready({});

      const store = createStore();
      store.subscribe((providerDetails) => {
        console.log("PROVIDER DETAILS", providerDetails);
      });
    };
    
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded, addFrame]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">
          {PROJECT_TITLE}
        </h1>
        <ClankerCard />
      </div>
    </div>
  );
}
