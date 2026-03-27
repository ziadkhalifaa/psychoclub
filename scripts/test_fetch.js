async function testFetch() {
    try {
        const res = await fetch('http://localhost:3000/api/courses');
        const data = await res.json();
        console.log("Total courses:", data.length);
        if (data.length > 0) {
            console.log("First course title:", data[0].title);
            console.log("First course createdAt:", data[0].createdAt);
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}
testFetch();
