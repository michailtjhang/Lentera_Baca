"use client";

import BaseNovelForm from "../BaseNovelForm";

export default function LightNovelForm(props: any) {
    return (
        <BaseNovelForm {...props} isLightNovel={true} />
    );
}
