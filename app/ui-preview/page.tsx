import type { Metadata } from "next";
import FullLottoLab from "@/lottolab-ui/src/FullLottoLab";
export const metadata: Metadata = {title:"LottoLab — UI-only Android design preview",description:"27-screen and 17-tool interactive prototype with sample data."};
export default function UiPreviewPage(){return <FullLottoLab/>;}
