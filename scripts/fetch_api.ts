
async function main() {
    const res = await fetch('http://localhost:3000/api/courses');
    const data = await res.json();
    console.log(JSON.stringify(data.map((c: any) => ({
        title: c.title,
        instructor: c.instructor
    })), null, 2));
}
main();
