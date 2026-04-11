"use client";

import { useState, useEffect } from "react";
import { Box, Flex, Center, Image } from "@chakra-ui/react";

interface LivePreviewProps {
  content: string;
  colunas?: number;
}

interface LogoData {
  width: number;
  height: number;
  data: string;
}

interface LogoRendererProps {
  dataJson?: string;
  url?: string;
}

function LogoRenderer({ dataJson, url }: LogoRendererProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(240);

  useEffect(() => {
    if (url) {
      setDataUrl(url);
      setImgWidth(240);
      return;
    }

    if (!dataJson) return;

    try {
      const { width, height, data } = JSON.parse(dataJson) as LogoData;
      setImgWidth(width);
      const binary = atob(data);
      const uint8 = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) uint8[i] = binary.charCodeAt(i);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = ctx.createImageData(width, height);
      const pixels = imageData.data;

      for (let i = 0; i < uint8.length; i++) {
        const val = uint8[i];
        const offset = i * 4;
        const color = val ? 0 : 255;
        pixels[offset] = color;
        pixels[offset + 1] = color;
        pixels[offset + 2] = color;
        pixels[offset + 3] = 255;
      }
      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL());
    } catch (e) {
      console.error("Erro ao renderizar logo no preview:", e);
    }
  }, [dataJson, url]);

  if (!dataUrl) return null;
  const printWidthDots = 384;
  const widthPercentage = Math.min((imgWidth / printWidthDots) * 100, 100);

  return (
    <Center mb="4">
      <Image
        src={dataUrl}
        alt="Logo"
        display="block"
        opacity="0.9"
        w={`${widthPercentage}%`}
        h="auto"
      />
    </Center>
  );
}

export function LivePreview({ content, colunas = 32 }: LivePreviewProps) {
  if (!content) {
    return (
      <Box
        p="4"
        bg="white"
        color="black"
        fontFamily="mono"
        minW="260px"
        textAlign="center"
        fontSize="xs"
      >
        O cupom está vazio.{"\n"}Adicione itens para visualizar.
      </Box>
    );
  }

  const lines = content.split("\n");

  return (
    <Box
      bg="white"
      color="black"
      fontFamily="mono"
      fontSize="12px"
      lineHeight="1.2"
      shadow="lg"
      w="fit-content"
      mx="auto"
      style={{ width: `${colunas}ch` }}
    >
      <Flex direction="column">
        {lines.map((line, i) => {
          if (line.includes("[IMG:")) {
            const imgMatches = line.match(/\[IMG:(.*?)\]/);
            if (imgMatches) {
              return <LogoRenderer key={i} dataJson={imgMatches[1]} />;
            }
          }

          if (line.includes("[IMG_URL:")) {
            const imgUrlMatches = line.match(/\[IMG_URL:(.*?)\]/);
            if (imgUrlMatches) {
              return <LogoRenderer key={i} url={imgUrlMatches[1]} />;
            }
          }

          const alignMatch = line.match(/\[ALIGN:(.*?)\](.*?)\[\/ALIGN\]/);
          if (alignMatch) {
            const mode = alignMatch[1];
            const textContent = alignMatch[2];
            return (
              <Box
                key={i}
                w="full"
                whiteSpace="pre"
                textAlign={
                  mode === "center"
                    ? "center"
                    : mode === "right"
                      ? "right"
                      : "left"
                }
              >
                {textContent || "\u00A0"}
              </Box>
            );
          }

          return (
            <Box key={i} minH="1em" whiteSpace="pre" w="full" textAlign="left">
              {line || "\u00A0"}
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
}
