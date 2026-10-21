"use client";

import BaseNovelForm from "../BaseNovelForm";

export default function WebNovelForm(props: any) {
    return (
        <BaseNovelForm {...props} isLightNovel={false} />
    );
}
