import finder from '@medv/finder'

document.body.addEventListener('click', e => {
  console.log(finder(e.target))
})