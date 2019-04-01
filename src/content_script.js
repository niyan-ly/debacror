import finder from '@medv/finder'

const p = document.createElement('p')
p.id = 'selected'
p.innerText = '请选择'
p.style.textAlign = 'center'

document.body.insertBefore(p, document.body.firstElementChild)
document.body.addEventListener('click', e => {
  e.preventDefault()
  p.innerText = finder(e.target)
})