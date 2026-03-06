import CourseDetailClient from "./CourseDetailClient";

export function generateStaticParams() {
    return [{ id: "_" }];
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return <CourseDetailClient params={params} />;
}
